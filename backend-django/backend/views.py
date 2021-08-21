from .models import User
from .serializers import UserSerializer
from rest_framework import viewsets
from django.http import HttpResponse
from django.middleware.csrf import get_token

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

def Auth(req):
    if req.method == 'GET':
        res =  HttpResponse(get_token())
        res.set_cookie('')
    elif req.method == 'POST':
        res = HttpResponse()
    # return HttpResponse(req.method)






# authentication on /auth
# POST /auth with {username, password}, returns session token
# use session token to make api calls
# create the api on /users
# POST /users





