from django.core.context_processors import csrf
from django.forms.models import modelformset_factory
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.template import RequestContext

from .models import Todo


def index(request):
    TodoFormSet = modelformset_factory(Todo, can_delete=True)
    if request.method == 'POST':
        formset = TodoFormSet(request.POST)
        if formset.is_valid():
            formset.save()
            return HttpResponseRedirect("/")
    else:
        formset = TodoFormSet()

    return render_to_response(
        'index.html',
        {'formset': formset},
        context_instance=RequestContext(request),
    )
