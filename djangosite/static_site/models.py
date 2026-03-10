from django.db import models
from django.contrib.auth.models import User

class Booking(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    order_id   = models.CharField(max_length=32, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    payment    = models.CharField(max_length=32)

    def __str__(self):
        return f"{self.order_id} — {self.user.username}"

class BookingItem(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    name    = models.CharField(max_length=255)
    price   = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
    
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user    = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    dob     = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    phone   = models.CharField(max_length=20, blank=True)

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()