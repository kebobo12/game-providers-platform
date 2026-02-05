"""
Admin-only API views for Game Providers Platform.

All endpoints require superuser permissions.
"""
import csv
import io
from io import StringIO

from django.core.management import call_command
from django.db import transaction
from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import (
    Country,
    CryptoCurrency,
    FiatCurrency,
    Game,
    Provider,
    Restriction,
)
from .serializers import (
    GameSerializer,
    ProviderDetailSerializer,
    ProviderListSerializer,
)


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Return detailed database statistics."""
    data = {
        'providers': Provider.objects.count(),
        'games': Game.objects.count(),
        'fiat_currencies': FiatCurrency.objects.count(),
        'crypto_currencies': CryptoCurrency.objects.count(),
        'restrictions': Restriction.objects.count(),
        'countries': Country.objects.count(),
        'last_sync': Provider.objects.exclude(last_synced__isnull=True)
                            .order_by('-last_synced')
                            .values_list('last_synced', flat=True)
                            .first(),
    }
    return Response(data)


# ---------------------------------------------------------------------------
# Sync
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_sync(request):
    """Trigger provider sync from external API."""
    out = StringIO()

    try:
        call_command('sync_providers', stdout=out, stderr=out)
        output = out.getvalue()

        # Parse summary from output
        lines = output.split('\n')
        stats = {
            'success': True,
            'output': output,
            'providers_processed': 0,
            'games_synced': 0,
        }

        for line in lines:
            if 'Providers processed:' in line:
                try:
                    stats['providers_processed'] = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass
            elif 'Total games synced:' in line:
                try:
                    stats['games_synced'] = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass

        return Response(stats)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'output': out.getvalue(),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Import
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_import(request):
    """Import data from uploaded file (CSV or Excel)."""
    if 'file' not in request.FILES:
        return Response(
            {'detail': 'No file provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_file = request.FILES['file']
    filename = uploaded_file.name.lower()

    try:
        if filename.endswith('.csv'):
            result = _import_csv(uploaded_file)
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            result = _import_excel(uploaded_file)
        else:
            return Response(
                {'detail': 'Unsupported file format. Use .csv or .xlsx'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(result)
    except Exception as e:
        return Response(
            {'detail': f'Import failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _import_csv(file):
    """Import providers from CSV file."""
    content = file.read().decode('utf-8-sig')  # Handle BOM
    reader = csv.DictReader(io.StringIO(content), delimiter=';')

    imported = 0
    skipped = 0
    errors = []

    for row_num, row in enumerate(reader, start=2):
        try:
            provider_name = row.get('Provider Name') or row.get('provider_name')
            if not provider_name:
                errors.append(f'Row {row_num}: Missing provider name')
                skipped += 1
                continue

            Provider.objects.update_or_create(
                provider_name=provider_name,
                defaults={
                    'status': row.get('Status', row.get('status', 'DRAFT')),
                    'currency_mode': row.get('Currency Mode', row.get('currency_mode', 'ALL_FIAT')),
                }
            )
            imported += 1
        except Exception as e:
            errors.append(f'Row {row_num}: {str(e)}')
            skipped += 1

    return {
        'imported': imported,
        'skipped': skipped,
        'errors': errors[:10],  # Limit errors shown
    }


def _import_excel(file):
    """Import providers from Excel file."""
    try:
        import openpyxl
    except ImportError:
        raise Exception('openpyxl not installed. Install with: pip install openpyxl')

    wb = openpyxl.load_workbook(file, read_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {'imported': 0, 'skipped': 0, 'errors': ['Empty file']}

    headers = [str(h).strip() if h else '' for h in rows[0]]
    name_col = None

    for i, h in enumerate(headers):
        if h.lower() in ('provider name', 'provider_name', 'name'):
            name_col = i
            break

    if name_col is None:
        return {'imported': 0, 'skipped': 0, 'errors': ['No provider name column found']}

    imported = 0
    skipped = 0
    errors = []

    for row_num, row in enumerate(rows[1:], start=2):
        try:
            provider_name = row[name_col] if name_col < len(row) else None
            if not provider_name:
                skipped += 1
                continue

            Provider.objects.update_or_create(
                provider_name=str(provider_name).strip(),
                defaults={'status': 'DRAFT', 'currency_mode': 'ALL_FIAT'}
            )
            imported += 1
        except Exception as e:
            errors.append(f'Row {row_num}: {str(e)}')
            skipped += 1

    return {
        'imported': imported,
        'skipped': skipped,
        'errors': errors[:10],
    }


# ---------------------------------------------------------------------------
# Provider CRUD
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_providers(request):
    """List all providers or create a new one."""
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        queryset = Provider.objects.with_game_count()

        if search:
            queryset = queryset.filter(provider_name__icontains=search)

        queryset = queryset.order_by('provider_name')
        serializer = ProviderListSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        provider_name = data.get('provider_name')

        if not provider_name:
            return Response(
                {'detail': 'Provider name is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Provider.objects.filter(provider_name=provider_name).exists():
            return Response(
                {'detail': 'Provider with this name already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider = Provider.objects.create(
            provider_name=provider_name,
            status=data.get('status', 'DRAFT'),
            currency_mode=data.get('currency_mode', 'ALL_FIAT'),
            notes=data.get('notes', ''),
        )

        # Re-fetch with game_count annotation
        provider = Provider.objects.with_game_count().get(pk=provider.pk)
        serializer = ProviderDetailSerializer(provider)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_provider_detail(request, pk):
    """Get, update, or delete a provider."""
    try:
        provider = Provider.objects.with_game_count().prefetch_related(
            'fiat_currencies', 'crypto_currencies', 'restrictions'
        ).get(pk=pk)
    except Provider.DoesNotExist:
        return Response(
            {'detail': 'Provider not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = ProviderDetailSerializer(provider)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data

        if 'provider_name' in data:
            # Check uniqueness
            existing = Provider.objects.filter(provider_name=data['provider_name']).exclude(pk=pk)
            if existing.exists():
                return Response(
                    {'detail': 'Provider with this name already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            provider.provider_name = data['provider_name']

        if 'status' in data:
            provider.status = data['status']
        if 'currency_mode' in data:
            provider.currency_mode = data['currency_mode']
        if 'notes' in data:
            provider.notes = data['notes']

        provider.save()
        serializer = ProviderDetailSerializer(provider)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        name = provider.provider_name
        provider.delete()
        return Response({'detail': f'Provider "{name}" deleted.'})


# ---------------------------------------------------------------------------
# Game CRUD
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_games(request):
    """List games (optionally by provider) or create a new game."""
    if request.method == 'GET':
        provider_id = request.query_params.get('provider')
        search = request.query_params.get('search', '')

        queryset = Game.objects.select_related('provider')

        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)

        if search:
            queryset = queryset.filter(game_title__icontains=search)

        queryset = queryset.order_by('game_title')[:500]  # Limit for performance
        serializer = GameSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        provider_id = data.get('provider')
        game_title = data.get('game_title')

        if not provider_id:
            return Response(
                {'detail': 'Provider ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not game_title:
            return Response(
                {'detail': 'Game title is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            provider = Provider.objects.get(pk=provider_id)
        except Provider.DoesNotExist:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        game = Game.objects.create(
            provider=provider,
            game_title=game_title,
            title=data.get('title', game_title),
            game_type=data.get('game_type', ''),
            platform=data.get('platform', ''),
            rtp=data.get('rtp'),
            volatility=data.get('volatility', ''),
            enabled=data.get('enabled', True),
            features=data.get('features', ''),
            themes=data.get('themes', ''),
            thumbnail=data.get('thumbnail', ''),
            source='manual',
        )

        serializer = GameSerializer(game)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_game_detail(request, pk):
    """Get, update, or delete a game."""
    try:
        game = Game.objects.select_related('provider').get(pk=pk)
    except Game.DoesNotExist:
        return Response(
            {'detail': 'Game not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = GameSerializer(game)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data

        if 'game_title' in data:
            game.game_title = data['game_title']
        if 'title' in data:
            game.title = data['title']
        if 'game_type' in data:
            game.game_type = data['game_type']
        if 'platform' in data:
            game.platform = data['platform']
        if 'rtp' in data:
            game.rtp = data['rtp']
        if 'volatility' in data:
            game.volatility = data['volatility']
        if 'enabled' in data:
            game.enabled = data['enabled']
        if 'features' in data:
            game.features = data['features']
        if 'themes' in data:
            game.themes = data['themes']
        if 'thumbnail' in data:
            game.thumbnail = data['thumbnail']

        game.save()
        serializer = GameSerializer(game)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        title = game.game_title
        game.delete()
        return Response({'detail': f'Game "{title}" deleted.'})


# ---------------------------------------------------------------------------
# Currency Management
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_provider_currencies(request, pk):
    """List or add currencies for a provider."""
    try:
        provider = Provider.objects.get(pk=pk)
    except Provider.DoesNotExist:
        return Response(
            {'detail': 'Provider not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        fiat = list(provider.fiat_currencies.values('id', 'currency_code'))
        crypto = list(provider.crypto_currencies.values('id', 'currency_code'))
        return Response({
            'fiat': fiat,
            'crypto': crypto,
        })

    elif request.method == 'POST':
        data = request.data
        currency_codes = data.get('currency_codes', '')
        currency_type = data.get('type', 'fiat').lower()

        if isinstance(currency_codes, str):
            codes = [c.strip().upper() for c in currency_codes.split(',') if c.strip()]
        else:
            codes = [str(c).strip().upper() for c in currency_codes if c]

        if not codes:
            return Response(
                {'detail': 'No currency codes provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        added = 0
        skipped = 0

        with transaction.atomic():
            for code in codes:
                if currency_type == 'crypto':
                    _, created = CryptoCurrency.objects.get_or_create(
                        provider=provider,
                        currency_code=code,
                        defaults={'source': 'manual'}
                    )
                else:
                    _, created = FiatCurrency.objects.get_or_create(
                        provider=provider,
                        currency_code=code,
                        defaults={'source': 'manual'}
                    )

                if created:
                    added += 1
                else:
                    skipped += 1

        return Response({
            'added': added,
            'skipped': skipped,
            'total_codes': len(codes),
        })


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_provider_currency_delete(request, pk, code):
    """Delete a currency from a provider."""
    try:
        provider = Provider.objects.get(pk=pk)
    except Provider.DoesNotExist:
        return Response(
            {'detail': 'Provider not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    currency_type = request.query_params.get('type', 'fiat').lower()
    code_upper = code.upper()

    deleted = False

    if currency_type == 'crypto':
        deleted_count, _ = CryptoCurrency.objects.filter(
            provider=provider, currency_code=code_upper
        ).delete()
        deleted = deleted_count > 0
    else:
        deleted_count, _ = FiatCurrency.objects.filter(
            provider=provider, currency_code=code_upper
        ).delete()
        deleted = deleted_count > 0

    if deleted:
        return Response({'detail': f'Currency {code_upper} removed.'})
    else:
        return Response(
            {'detail': 'Currency not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


# ---------------------------------------------------------------------------
# Restriction Management
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_provider_restrictions(request, pk):
    """List or add restrictions for a provider."""
    try:
        provider = Provider.objects.get(pk=pk)
    except Provider.DoesNotExist:
        return Response(
            {'detail': 'Provider not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        restrictions = list(provider.restrictions.values(
            'id', 'country_code', 'restriction_type'
        ))
        return Response(restrictions)

    elif request.method == 'POST':
        data = request.data
        country_codes = data.get('country_codes', '')
        restriction_type = data.get('restriction_type', 'RESTRICTED').upper()

        if restriction_type not in ('RESTRICTED', 'REGULATED'):
            return Response(
                {'detail': 'Invalid restriction type. Use RESTRICTED or REGULATED.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if isinstance(country_codes, str):
            codes = [c.strip().upper() for c in country_codes.split(',') if c.strip()]
        else:
            codes = [str(c).strip().upper() for c in country_codes if c]

        if not codes:
            return Response(
                {'detail': 'No country codes provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        added = 0
        updated = 0
        skipped = 0

        with transaction.atomic():
            for code in codes:
                obj, created = Restriction.objects.get_or_create(
                    provider=provider,
                    country_code=code,
                    defaults={
                        'restriction_type': restriction_type,
                        'source': 'manual',
                    }
                )
                if created:
                    added += 1
                elif obj.restriction_type != restriction_type:
                    obj.restriction_type = restriction_type
                    obj.save()
                    updated += 1
                else:
                    skipped += 1

        return Response({
            'added': added,
            'updated': updated,
            'skipped': skipped,
            'total_codes': len(codes),
        })


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_provider_restriction_delete(request, pk, restriction_id):
    """Delete a restriction from a provider."""
    try:
        provider = Provider.objects.get(pk=pk)
    except Provider.DoesNotExist:
        return Response(
            {'detail': 'Provider not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    deleted_count, _ = Restriction.objects.filter(
        provider=provider, id=restriction_id
    ).delete()

    if deleted_count > 0:
        return Response({'detail': 'Restriction removed.'})
    else:
        return Response(
            {'detail': 'Restriction not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
