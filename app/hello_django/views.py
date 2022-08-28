from django.views.generic import TemplateView
from django.contrib.auth.views import LoginView
from django.contrib.auth.mixins import LoginRequiredMixin

from .forms import LoginForm

# Create your views here.


class DataVisualizationView(LoginRequiredMixin, TemplateView):
    template_name = "capacity_visualization.html"


class IntroductionView(TemplateView):
    template_name = "introduction.html"


class SampleView(TemplateView):
    template_name = "sample.html"


class Login(LoginView):
    """ Log-in page """
    form_class = LoginForm
    template_name = "login.html"
