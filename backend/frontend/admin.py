# admin.py
from django.contrib import admin
from .models import Number, Setting, SettingNumber
from adminsortable2.admin import SortableAdminBase, SortableInlineAdminMixin
from django.utils.html import format_html

@admin.register(Number)
class NumberAdmin(admin.ModelAdmin):
    list_display = ('value', 'flag_colored')
    list_display_links = ('flag_colored',)
    list_editable = ('value',)
    list_filter = ('flag',)
    search_fields = ('value',)

    def flag_colored(self, obj):
        color = 'green' if obj.flag else 'red'
        status = 'Да' if obj.flag else 'Нет'
        return format_html('<span style="color: {};">{}</span>', color, status)
    flag_colored.short_description = "Использовано"


class SettingNumberInline(SortableInlineAdminMixin, admin.TabularInline):
    model = SettingNumber
    extra = 0
    autocomplete_fields = ['number']
    fields = ['number']



@admin.register(Setting)
class SettingAdmin(SortableAdminBase, admin.ModelAdmin): 
    inlines = [SettingNumberInline]

    def has_add_permission(self, request):
        return not Setting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False