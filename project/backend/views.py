from django.shortcuts import render
from .models import StudioState
from .serializers import StudioStateSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required


locale_weekdays = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
]


# Create your views here.
def index(request):
    date = datetime.today()
    return render(request, "index.html", {
        "weekday": locale_weekdays[date.weekday()],
        "date": date.strftime('%d.%m.%Y')
    })


@api_view(['GET', 'POST'])
def get_state(request):
    ss = StudioState.objects.first()

    if request.method == "GET":
        if ss.date == datetime.now().date():
            return Response(StudioStateSerializer(ss, many=False).data)

    if request.method == "POST":
        state = request.data.get('state')
        time_from = request.data.get('time_from')
        time_to = request.data.get('time_to')

        if ss.date == datetime.now().date():
            if state:
                ss.set_state(state)
            if time_from and time_to:
                ss.set_time(time_from, 'from')
                ss.set_time(time_to, 'to')
            return Response(StudioStateSerializer(ss, many=False).data)

    return Response({"state": "Undefined"})


@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username and password:
        user = authenticate(
            username=username,
            password=password
        )

        if user:
            last_date = StudioState.objects.first().date
            now_date = datetime.now().date()

            for i in range((now_date - last_date).days):
                StudioState.objects.create(date=last_date+timedelta(days=i+1))

            return Response({'message': "Successfully"}, status=200)
        return Response(status=401)
    return Response(status=401)
