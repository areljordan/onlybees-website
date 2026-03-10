import json, uuid
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Booking, BookingItem

def home(request):
    return render(request, 'static_site/home.html')

def services(request):
    return render(request, 'static_site/services.html')

def signup_view(request):
    if request.method == 'POST':
        name     = request.POST.get('name', '').strip()
        email    = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm  = request.POST.get('confirmPassword', '')
        dob      = request.POST.get('dob', '')
        address  = request.POST.get('address', '').strip()

        if password != confirm:
            messages.error(request, 'Passwords do not match.')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'An account with this email already exists.')
        elif len(password) < 6:
            messages.error(request, 'Password must be at least 6 characters.')
        else:
            user = User.objects.create_user(
                username=email, email=email,
                password=password,
                first_name=name
            )
            user.profile.dob     = dob
            user.profile.address = address
            user.profile.save()
            messages.success(request, 'Account created! Please log in.')
            return redirect('login')
    return render(request, 'static_site/signup.html')

def login_view(request):
    if request.method == 'POST':
        email    = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        user     = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect('profile')
        messages.error(request, 'Incorrect email or password.')
    return render(request, 'static_site/login.html')

def logout_view(request):
    logout(request)
    return redirect('home')

@login_required
def profile(request):
    bookings = Booking.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
    return render(request, 'static_site/profile.html', {'bookings': bookings})

@login_required
def checkout(request):
    if request.method == 'POST':
        cart_json = request.POST.get('cart', '[]')
        payment   = request.POST.get('payment', 'Card')
        cart      = json.loads(cart_json)
        if cart:
            total   = sum(i['price'] for i in cart)
            booking = Booking.objects.create(
                user=request.user,
                order_id='OB' + uuid.uuid4().hex[:10].upper(),
                total=total,
                payment=payment,
            )
            for item in cart:
                BookingItem.objects.create(booking=booking, name=item['name'], price=item['price'])
            return redirect('profile')
    return render(request, 'static_site/wishlist.html')