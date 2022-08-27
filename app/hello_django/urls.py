"""hello_django URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import Login, Introduction, DataVisualizationView

# # For test staticfiles
# from django.views.static import serve
# from django.urls import re_path
# from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),

    path("introduction/", Introduction.as_view(),
         name="introduction"),

    path("dv-production/", DataVisualizationView.as_view(),
         name="dv-production"),

    path("login/", Login.as_view(),
         name="login"),

    path("sample-data/", DataVisualizationView.as_view(),
         name="test"),
]

# #  # For test staticfiles
# urlpatterns += [
#     re_path(r'^staticfiles/(?P<path>.*)$', serve,
#         {'document_root': settings.STATIC_ROOT}),
# ]
