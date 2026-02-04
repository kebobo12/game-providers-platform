"""
Management command to create a default admin user.
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Creates a default admin user if none exists'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            default=os.environ.get('ADMIN_USERNAME', 'admin'),
            help='Admin username (default: admin or ADMIN_USERNAME env var)',
        )
        parser.add_argument(
            '--password',
            default=os.environ.get('ADMIN_PASSWORD', 'admin123'),
            help='Admin password (default: admin123 or ADMIN_PASSWORD env var)',
        )
        parser.add_argument(
            '--email',
            default=os.environ.get('ADMIN_EMAIL', 'admin@example.com'),
            help='Admin email (default: admin@example.com or ADMIN_EMAIL env var)',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        password = options['password']
        email = options['email']

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists.')
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created admin user "{username}"')
        )
