"""
Management command to sync providers and games from external API.

Ported from backend/scripts/api_sync.py - uses Django ORM instead of raw SQLite.

Usage:
    docker compose exec backend python manage.py sync_providers
"""
import json
import os
from datetime import datetime

import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from providers.models import Game, Provider


# Provider name mapping: API name -> DB name
PROVIDER_MAPPING = {
    # Pragmatic Play variants
    "Pragmatic Play Slots": "Pragmatic Play",
    "Pragmatic Play Live": "Pragmatic Play",
    "Pragmatic Play Virtual": "Pragmatic Play",
    "Pragmatic Play Scratch": "Pragmatic Play",

    # Platipus variants
    "Platipus": "Platipus",
    "Platipus Live": "Platipus",

    # Skywind variants
    "Skywind": "Skywind",
    "Skywind-live": "Skywind",

    # PopOK variants
    "PopOK": "PopOK",
    "PopOK Live": "PopOK",

    # MicroGaming variants
    "MicroGaming": "Microgaming",
    "MicroGaming Live": "Microgaming",

    # Amusnet variants
    "Amusnet": "Amusnet",
    "Amusnet Live": "Amusnet",

    # PatePlay variants
    "PatePlay": "PatePlay",
    "PatePlay Live": "PatePlay",

    # Iconic21 variants
    "Iconic21": "Iconic21",
    "Iconic21 Live": "Iconic21",

    # Jacktop variants
    "Jacktop": "Jacktop",
    "Jacktop Live": "Jacktop",

    # 7Mojos variants
    "7Mojos Live": "7 mojos",
    "7Mojos Slots": "7 mojos",
    "7-Mojos Live": "7 mojos",
    "7-Mojos": "7 mojos",

    # TVBet
    "TVBet Live": "TVBet",

    # Yeebet
    "Yeebet Live": "YeeBet Live",

    # Name normalizations
    "Vivo": "VIVO",
    "GlobalBet": "GoldenRace",
    "Spribe": "Spribe",
    "Netgame": "Netgame",
    "Macaw": "Macaw",
    "BitVille": "Bitville",
    "Evoplay": "Evoplay",
    "Ezugi": "Ezugi",
    "Booming": "Booming",
    "Caleta Gaming": "Caleta Gaming",
    "KAGaming": "KA GAMING",
    "Habanero": "Habanero",
    "Mancala Gaming": "Mancala Gaming",
    "Golden Race": "GoldenRace",
    "BetOnGames": "Bet On Games",
    "7777 Gaming": "7777 Gaming",
    "Absolute Live Gaming": "Absolute",
    "Religa": "Religa",
    "Altente": "Altente",
    "Endorphina": "Endorphina",
    "OneTouch": "One Touch",
    "BFGames": "BFGames",
    "Spinomenal": "Spinomenal",
    "Adlunam": "AdLunam",
    "ArmadilloStudios": "Armadillo Studios",
    "FlipLuck": "FlipLuck",
    "Irondog": "Iron Dog Studios",
    "JVL": "JVL",
    "ProspectGaming": "Prospect Gaming",
    "Spearhead": "Spearhead",
    "1x2Gaming": "1x2 Gaming",
    "Fils": "Fils",
    "LiWGames": "LIWGames",
    "Smartsoft": "Smartsoft",
    "PGSoft": "PG SOFT",
    "PlatinGaming": "PlatinGaming",
    "Galaxsys": "Galaxsys",
    "EAGaming": "EAGaming",
    "3Oaks": "3Oaks",
    "Play-son": "Playson",
    "TurboGames": "Turbo Games",
    "Novomatic": "Novomatic",
    "CTInteractive": "CT Interactive",
    "Gamzix": "Gamzix",
    "RedRake": "Red Rake",
    "Aviatrix": "Aviatrix",
    "AmigoGaming": "Amigo Gaming",
    "BigPot": "Bigpot",
    "EvolutionLive": "Evolution Live",
    "RedTiger": "Red Tiger",
    "Netent": "Net Ent",
    "NoLimitCity": "NoLimit City",
    "Big Time Gaming": "Big Time Gaming",
    "Pascal Gaming": "Pascal Gaming",
    "Creedroomz": "Creedz",
    "Hacksaw": "Hacksaw Gaming",
    "Backseat Gaming": "Backseat Gaming",
    "BullShark Games": "BullShark Games",
    "Hacksaw-OpenRGS": "Hacksaw Gaming",
    "EGT Digital": "EGT Digital",
    "RubyPlay": "RubyPlay",
    "LiveGames": "LiveGames",
    "Fazi": "Fazi",
    "SAGaming": "SA Gaming",
    "OneGame": "OneGame",
    "AirDice": "AirDice",
    "BitBlox": "BitBlox",
    "BetSoft": "Betsoft",
    "Wazdan": "Wazdan",
    "Yggdrasil": "Yggdrasil",
    "TaDa Gaming": "TaDa Gaming",
    "Apparat Gaming": "Apparat",
    "BallyWulff": "BW Gaming",
    "BarbaraBang": "Barbarabang",
    "100HP Gaming": "100HP Gaming",
    "OnlyPlay": "OnlyPlay",
    "Bgaming": "BGaming",
    "EezeCasino": "Eeze Casino",
    "Dreamplay": "DreamPlay",
    "PopiPlay": "PopiPlay",
    "YOriginal Games": "YOriginal Games",
    "SimplePlay": "Simple Play",
    "Beon": "Beon",
    "ShadyLady": "Shady Lady",
    "WickedGames": "Wicked Games",
    "Formula Spin": "Formula Spin",
    "Gamebeat": "GameBeat",
    "Phoenix7": "Phoenix7",
    "PixmoveGames": "Pixmove Games",
    "Clawbuster": "Clawbuster",
    "Winfinity": "Winfinity",
    "Pigaboom": "Pig A Boom",
    "InOut": "InOut",
    "AbraCadabra": "AbraCadabra",
    "AvatarUX": "AvatarUX",
    "Mascot Gaming": "Mascot Gaming",
    "SpinLogic": "SpinLogic (RTG Slots)",
    "MaracashGames": "Maracash Games",
    "Hot Dog": "HotDog Gaming",
    "Ela Games": "Ela Games",
    "Iconix Interactive": "Iconix",
    "ImagineLive": "ImagineLive",
    "Live88": "Live88",
    "Winspinity": "Winspinity",
}


def normalize_provider_name(api_name: str) -> str:
    """Map API provider name to DB provider name."""
    return PROVIDER_MAPPING.get(api_name, api_name)


class Command(BaseCommand):
    help = 'Sync providers and games from external API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be synced without making changes',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.start_time = datetime.now()

        self.stdout.write('=' * 60)
        self.stdout.write('API SYNC STARTED')
        self.stdout.write('=' * 60)

        if self.dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - no changes will be made'))

        config = self._get_api_config()
        if not config['base_url']:
            self.stdout.write(self.style.ERROR('API_BASE_URL not configured!'))
            return

        self.stdout.write(f"API Base URL: {config['base_url']}")
        self.config = config

        try:
            api_providers = self._fetch_providers()
            self.stdout.write(f'Found {len(api_providers)} API providers')

            db_provider_groups = self._group_providers(api_providers)
            self.stdout.write(f'Mapped to {len(db_provider_groups)} unique DB providers')

            stats = self._sync_providers(db_provider_groups)
            self._print_summary(stats)

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'API error: {e}'))
            raise

    def _get_api_config(self) -> dict:
        """Get API configuration from environment."""
        return {
            'base_url': os.environ.get('API_BASE_URL', ''),
            'operator_id': os.environ.get('X_OPERATOR_ID', ''),
            'auth_key': os.environ.get('X_AUTHORIZATION', ''),
        }

    def _get_headers(self) -> dict:
        """Build request headers."""
        return {
            'X-Operator-Id': self.config['operator_id'],
            'X-Authorization': self.config['auth_key'],
            'Content-Type': 'application/json',
        }

    def _fetch_providers(self) -> list[str]:
        """Fetch all providers from API."""
        url = f"{self.config['base_url']}/api/generic/games/v2/providers"
        response = requests.get(url, headers=self._get_headers())
        response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and 'data' in data:
            return data['data']
        return data

    def _fetch_games(self, provider_name: str) -> list[dict]:
        """Fetch games for a specific provider."""
        url = f"{self.config['base_url']}/api/generic/games/v2/list"
        params = {'providers': provider_name}

        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and 'data' in data:
            return data['data']
        return data

    def _group_providers(self, api_providers: list[str]) -> dict[str, list[str]]:
        """Group API providers by their DB mapping."""
        groups = {}
        for api_name in api_providers:
            db_name = normalize_provider_name(api_name)
            if db_name not in groups:
                groups[db_name] = []
            groups[db_name].append(api_name)
        return groups

    def _sync_providers(self, db_provider_groups: dict[str, list[str]]) -> dict:
        """Sync all providers and their games."""
        stats = {
            'total_providers': 0,
            'total_games': 0,
            'new_providers': [],
            'updated_providers': [],
            'failed_providers': [],
        }

        for idx, (db_name, api_variants) in enumerate(db_provider_groups.items(), 1):
            self.stdout.write(f'[{idx}/{len(db_provider_groups)}] Processing: {db_name}')

            try:
                with transaction.atomic():
                    provider, created = Provider.objects.get_or_create(
                        provider_name=db_name,
                        defaults={
                            'currency_mode': 'ALL_FIAT',
                            'status': 'ACTIVE',
                        }
                    )

                    if created:
                        stats['new_providers'].append(db_name)
                        self.stdout.write(f'  NEW provider created (ID: {provider.id})')
                    else:
                        self.stdout.write(f'  Existing provider (ID: {provider.id})')

                    all_games = []
                    for api_name in api_variants:
                        try:
                            games = self._fetch_games(api_name)
                            self.stdout.write(f'    {api_name}: {len(games)} games')
                            all_games.extend(games)
                        except requests.RequestException as e:
                            self.stdout.write(
                                self.style.WARNING(f'    {api_name}: FAILED - {e}')
                            )

                    if all_games and not self.dry_run:
                        result = self._replace_games(provider, all_games)
                        stats['total_games'] += len(all_games)
                        if result['old_count'] > 0:
                            stats['updated_providers'].append(
                                (db_name, result['old_count'], len(all_games))
                            )
                            self.stdout.write(
                                f"  -> Replaced {result['old_count']} with {len(all_games)} games"
                            )
                        else:
                            self.stdout.write(f'  -> Added {len(all_games)} games')

                        provider.last_synced = timezone.now()
                        provider.save(update_fields=['last_synced'])

                    stats['total_providers'] += 1

            except Exception as e:
                stats['failed_providers'].append((db_name, str(e)))
                self.stdout.write(self.style.ERROR(f'  -> FAILED: {e}'))

        return stats

    def _replace_games(self, provider: Provider, games: list[dict]) -> dict:
        """Replace all games for a provider with new data."""
        old_count = provider.games.filter(source='api_sync').count()
        provider.games.filter(source='api_sync').delete()

        game_objects = []
        for g in games:
            details = g.get('details', {})
            thumbnails = details.get('thumbnails', {})
            thumbnail = (
                thumbnails.get('440x590-jpg') or
                thumbnails.get('440x590') or
                thumbnails.get('300x300') or
                next(iter(thumbnails.values()), None) if thumbnails else None
            )

            title = g.get('title') or 'Unknown'
            game_objects.append(Game(
                provider=provider,
                game_id=g.get('id'),
                game_title=title,
                title=title,
                platform=g.get('platform'),
                game_type=g.get('type'),
                subtype=g.get('subtype'),
                enabled=g.get('enabled', True),
                fun_mode=g.get('fun_mode', False),
                rtp=details.get('rtp'),
                volatility=details.get('volatility'),
                features=json.dumps(details.get('features', [])),
                themes=json.dumps(details.get('themes', [])),
                tags=json.dumps(details.get('tags', [])),
                thumbnail=thumbnail,
                api_provider=g.get('provider'),
                source='api_sync',
            ))

        Game.objects.bulk_create(game_objects)
        return {'old_count': old_count, 'new_count': len(games)}

    def _print_summary(self, stats: dict):
        """Print sync summary."""
        elapsed = datetime.now() - self.start_time

        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('SYNC COMPLETE'))
        self.stdout.write('=' * 60)
        self.stdout.write(f"Duration: {elapsed.total_seconds():.1f} seconds")
        self.stdout.write(f"Providers processed: {stats['total_providers']}")
        self.stdout.write(f"Total games synced: {stats['total_games']}")

        if stats['new_providers']:
            self.stdout.write('')
            self.stdout.write(f"NEW PROVIDERS ({len(stats['new_providers'])}):")
            for p in stats['new_providers']:
                self.stdout.write(f'  + {p}')

        if stats['updated_providers']:
            self.stdout.write('')
            self.stdout.write(f"UPDATED PROVIDERS ({len(stats['updated_providers'])}):")
            for name, old, new in stats['updated_providers']:
                diff = new - old
                diff_str = f'+{diff}' if diff > 0 else str(diff)
                self.stdout.write(f'  ~ {name}: {old} -> {new} ({diff_str})')

        if stats['failed_providers']:
            self.stdout.write('')
            self.stdout.write(
                self.style.WARNING(f"FAILED PROVIDERS ({len(stats['failed_providers'])}):")
            )
            for name, err in stats['failed_providers']:
                self.stdout.write(f'  ! {name}: {err}')
