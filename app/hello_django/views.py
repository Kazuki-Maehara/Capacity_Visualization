from django.views.generic import TemplateView
# Create your views here.


class DataVisualizationView(TemplateView):
    template_name = "capacity_visualization.html"
