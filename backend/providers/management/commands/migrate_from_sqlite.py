"""
Management command to migrate data from SQLite to Postgres.

Usage:
    docker compose exec backend python manage.py migrate_from_sqlite /path/to/database.sqlite
"""
import sqlite3
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from providers.models import (
    Country,
    CryptoCurrency,
    FiatCurrency,
    Game,
    Provider,
    Restriction,
)


class Command(BaseCommand):
    help = 'Migrate data from SQLite database to Postgres'

    def add_arguments(self, parser):
        parser.add_argument(
            'sqlite_path',
            type=str,
            help='Path to the SQLite database file',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before import',
        )

    def handle(self, *args, **options):
        sqlite_path = Path(options['sqlite_path'])

        if not sqlite_path.exists():
            raise CommandError(f'SQLite database not found: {sqlite_path}')

        self.stdout.write(f'Connecting to SQLite: {sqlite_path}')
        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row

        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self._clear_data()

        try:
            with transaction.atomic():
                stats = {
                    'countries': self._migrate_countries(conn),
                    'providers': self._migrate_providers(conn),
                    'fiat_currencies': self._migrate_fiat_currencies(conn),
                    'crypto_currencies': self._migrate_crypto_currencies(conn),
                    'restrictions': self._migrate_restrictions(conn),
                    'games': self._migrate_games(conn),
                }

            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(self.style.SUCCESS('MIGRATION COMPLETE'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            for table, result in stats.items():
                self.stdout.write(
                    f"  {table}: {result['inserted']} inserted, "
                    f"{result['skipped']} skipped, {result['errors']} errors"
                )

        except Exception as e:
            raise CommandError(f'Migration failed: {e}')
        finally:
            conn.close()

    def _clear_data(self):
        """Clear all existing data."""
        Game.objects.all().delete()
        Restriction.objects.all().delete()
        CryptoCurrency.objects.all().delete()
        FiatCurrency.objects.all().delete()
        Provider.objects.all().delete()
        Country.objects.all().delete()
        self.stdout.write('  Data cleared.')

    def _migrate_countries(self, conn) -> dict:
        """Migrate countries table."""
        self.stdout.write('')
        self.stdout.write('Migrating countries...')
        cursor = conn.execute('SELECT iso3, iso2, name FROM countries')
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0

        for row in rows:
            try:
                _, created = Country.objects.get_or_create(
                    iso3=row['iso3'],
                    defaults={
                        'iso2': row['iso2'],
                        'name': row['name'],
                    }
                )
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error: {row['iso3']} - {e}"))
                errors += 1

        self.stdout.write(f'  Countries: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}

    def _migrate_providers(self, conn) -> dict:
        """Migrate providers table."""
        self.stdout.write('')
        self.stdout.write('Migrating providers...')
        cursor = conn.execute(
            'SELECT provider_id, provider_name, status, currency_mode, '
            'google_sheet_id, last_synced, notes FROM providers'
        )
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0
        self._provider_id_map = {}

        for row in rows:
            try:
                provider, created = Provider.objects.get_or_create(
                    provider_name=row['provider_name'],
                    defaults={
                        'status': row['status'] or 'DRAFT',
                        'currency_mode': row['currency_mode'] or 'ALL_FIAT',
                        'google_sheet_id': row['google_sheet_id'],
                        'notes': row['notes'],
                    }
                )
                self._provider_id_map[row['provider_id']] = provider.id
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error: {row['provider_name']} - {e}")
                )
                errors += 1

        self.stdout.write(f'  Providers: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}

    def _migrate_fiat_currencies(self, conn) -> dict:
        """Migrate fiat_currencies table."""
        self.stdout.write('')
        self.stdout.write('Migrating fiat currencies...')
        cursor = conn.execute(
            'SELECT provider_id, currency_code, display, source FROM fiat_currencies'
        )
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0

        for row in rows:
            provider_id = self._provider_id_map.get(row['provider_id'])
            if not provider_id:
                skipped += 1
                continue

            try:
                _, created = FiatCurrency.objects.get_or_create(
                    provider_id=provider_id,
                    currency_code=row['currency_code'],
                    defaults={
                        'display': bool(row['display']),
                        'source': row['source'],
                    }
                )
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error: {row['currency_code']} - {e}")
                )
                errors += 1

        self.stdout.write(f'  Fiat currencies: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}

    def _migrate_crypto_currencies(self, conn) -> dict:
        """Migrate crypto_currencies table."""
        self.stdout.write('')
        self.stdout.write('Migrating crypto currencies...')
        cursor = conn.execute(
            'SELECT provider_id, currency_code, display, source FROM crypto_currencies'
        )
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0

        for row in rows:
            provider_id = self._provider_id_map.get(row['provider_id'])
            if not provider_id:
                skipped += 1
                continue

            try:
                _, created = CryptoCurrency.objects.get_or_create(
                    provider_id=provider_id,
                    currency_code=row['currency_code'],
                    defaults={
                        'display': bool(row['display']),
                        'source': row['source'],
                    }
                )
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error: {row['currency_code']} - {e}")
                )
                errors += 1

        self.stdout.write(f'  Crypto currencies: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}

    def _migrate_restrictions(self, conn) -> dict:
        """Migrate restrictions table."""
        self.stdout.write('')
        self.stdout.write('Migrating restrictions...')
        cursor = conn.execute(
            'SELECT provider_id, country_code, restriction_type, source FROM restrictions'
        )
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0

        for row in rows:
            provider_id = self._provider_id_map.get(row['provider_id'])
            if not provider_id:
                skipped += 1
                continue

            try:
                _, created = Restriction.objects.get_or_create(
                    provider_id=provider_id,
                    country_code=row['country_code'],
                    defaults={
                        'restriction_type': row['restriction_type'] or 'RESTRICTED',
                        'source': row['source'],
                    }
                )
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error: {row['country_code']} - {e}")
                )
                errors += 1

        self.stdout.write(f'  Restrictions: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}

    def _migrate_games(self, conn) -> dict:
        """Migrate games table."""
        self.stdout.write('')
        self.stdout.write('Migrating games...')
        cursor = conn.execute(
            'SELECT id, provider_id, wallet_game_id, game_title, game_provider, '
            'vendor, game_type, source, game_id, title, platform, subtype, '
            'enabled, fun_mode, rtp, volatility, features, themes, tags, '
            'thumbnail, api_provider FROM games'
        )
        rows = cursor.fetchall()

        inserted = 0
        skipped = 0
        errors = 0
        batch = []
        batch_size = 500

        for row in rows:
            provider_id = self._provider_id_map.get(row['provider_id'])
            if not provider_id:
                skipped += 1
                continue

            try:
                game = Game(
                    provider_id=provider_id,
                    wallet_game_id=row['wallet_game_id'],
                    game_title=row['game_title'] or 'Unknown',
                    game_provider=row['game_provider'],
                    vendor=row['vendor'],
                    game_type=row['game_type'],
                    source=row['source'],
                    game_id=row['game_id'],
                    title=row['title'],
                    platform=row['platform'],
                    subtype=row['subtype'],
                    enabled=bool(row['enabled']) if row['enabled'] is not None else True,
                    fun_mode=bool(row['fun_mode']) if row['fun_mode'] is not None else False,
                    rtp=row['rtp'],
                    volatility=row['volatility'],
                    features=row['features'],
                    themes=row['themes'],
                    tags=row['tags'],
                    thumbnail=row['thumbnail'],
                    api_provider=row['api_provider'],
                )
                batch.append(game)

                if len(batch) >= batch_size:
                    Game.objects.bulk_create(batch, ignore_conflicts=True)
                    inserted += len(batch)
                    self.stdout.write(f'  ... {inserted} games processed')
                    batch = []

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error: {row['game_title']} - {e}")
                )
                errors += 1

        if batch:
            Game.objects.bulk_create(batch, ignore_conflicts=True)
            inserted += len(batch)

        self.stdout.write(f'  Games: {inserted} inserted, {skipped} skipped')
        return {'inserted': inserted, 'skipped': skipped, 'errors': errors}
