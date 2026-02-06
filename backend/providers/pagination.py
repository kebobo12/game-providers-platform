from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Default pagination with client-controllable page size."""

    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 10000
