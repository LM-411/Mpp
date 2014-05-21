function checkRequirements()
{
   if (navigator.network.connection.type == Connection.NONE)
   {
      navigator.notification.alert(
         'To use this app you must enable your internet connection',
         function(){},
         'Warning'
      );
      return false;
   }
 
   return true;
}

function updateIcons()
{
   if ($(window).width() > 480)
   {
      $('a[data-icon], button[data-icon]').each(
         function()
         {
            $(this).removeAttr('data-iconpos');
         }
      );
   }
   else
   {
      $('a[data-icon], button[data-icon]').each(
         function()
         {
            $(this).attr('data-iconpos', 'notext');
         }
      );
   }
}
function urlParam(name)
{
   var results = new RegExp('[?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
   if (results != null && typeof results[1] !== 'undefined')
      return results[1];
   else
      return null;
}
$('#set-car-position, #find-car').click(function() {
   if (checkRequirements() === false)
   {
      $(this).removeClass('ui-btn-active');
      return false;
   }
});
$(document).on('pagebeforecreate orientationchange', updateIcons);