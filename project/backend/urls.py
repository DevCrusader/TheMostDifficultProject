from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from .views import index, get_state, user_login


urlpatterns = [
    path('', index, name="index"),
    path('login/', user_login, name='user-login'),
    # path('logout/', user_logout, name='user-logout'),
    path('state/', get_state, name="get-state"),
]

urlpatterns += staticfiles_urlpatterns()
