function Position(position, address, datetime)
{
  var _db = window.localStorage;
  var MAX_POSITIONS = 50;
 
  this.getMaxPositions = function()
  {
    return MAX_POSITIONS;
  }

  this.savePosition = function(position, address)
{
  if (!_db)
  {
    console.log('The database is null. Unable to save position');
    navigator.notification.alert(
      'Unable to save position',
      function(){},
      'Error'
    );
  }
 
  var positions = this.getPositions();
  if (positions == null)
    positions = [];
 
  positions.unshift(new Position(position, address, new Date()));
  // Only the top MAX_POSITIONS results are needed
  if (positions.length > this.MAX_POSITIONS)
    positions = positions.slice(0, this.MAX_POSITIONS);
 
  _db.setItem('positions', JSON.stringify(positions));
 
  return positions;
}
 
this.updatePosition = function(index, position, address)
{
  if (!_db)
  {
    console.log('The database is null. Unable to update position');
    navigator.notification.alert(
      'Unable to update position',
      function(){},
      'Error'
    );
  }
 
  var positions = this.getPositions();
  if (positions != null && positions[index] != undefined)
  {
    positions[index].coords = position;
    positions[index].address = address;
  }
 
  _db.setItem('positions', JSON.stringify(positions));
 
  return positions;
}
 
this.deletePosition = function(index)
{
  if (!_db)
  {
    console.log('The database is null. Unable to delete position');
    navigator.notification.alert(
      'Unable to delete position',
      function(){},
      'Error'
    );
  }
 
  var positions = this.getPositions();
  if (positions != null && positions[index] != undefined)
    positions.splice(index, 1);
 
  _db.setItem('positions', JSON.stringify(positions));
 
  return positions;
}
 
this.getPositions = function()
{
  if (!_db)
  {
    console.log('The database is null. Unable to retrieve positions');
    navigator.notification.alert(
      'Unable to retrieve positions',
      function(){},
      'Error'
    );
  }
 
  var positions = JSON.parse(_db.getItem('positions'));
  if (positions == null)
    positions = [];
 
  return positions;
}
 
  this.position = position;
  this.address = address;
  this.datetime = datetime;
}
 
function Coords(latitude, longitude, accuracy)
{
  this.latitude = latitude;
  this.longitude = longitude;
  this.accuracy = accuracy;
}

$('#positions-page').live(
   'pageinit',
   function()
   {
      createPositionsHistoryList('positions-list', (new Position()).getPositions());
   }
);

/**
 * Create the positions' history list
 */
function createPositionsHistoryList(idElement, positions)
{
   if (positions == null || positions.length == 0)
      return;
 
   $('#' + idElement).empty();
   var $listElement, $linkElement, dateTime;
   for(var i = 0; i < positions.length; i++)
   {
      $listElement = $('<li>');
      $linkElement = $('<a>');
      $linkElement
      .attr('href', '#')
      .click(
         function()
         {
            if (checkRequirements() === false)
               return false;
 
            $.mobile.changePage(
               'map.html',
               {
                  data: {
                     requestType: 'get',
                     index: $(this).closest('li').index()
                  }
               }
            );
         }
      );
 
      if (positions[i].address == '' || positions[i].address == null)
         $linkElement.text('Address not found');
      else
         $linkElement.text(positions[i].address);
 
      dateTime = new Date(positions[i].datetime);
      $linkElement.text(
         $linkElement.text() + ' @ ' +
         dateTime.toLocaleDateString() + ' ' +
         dateTime.toLocaleTimeString()
      );
 
      // Append the link to the <li> element
      $listElement.append($linkElement);
 
      $linkElement = $('<a>');
      $linkElement.attr('href', '#')
      .text('Delete')
      .click(
         function()
         {
            var position = new Position();
            var oldLenght = position.getPositions().length;
            var $parentUl = $(this).closest('ul');
 
            position.deletePosition($(this).closest('li').index());
            if (oldLenght == position.getPositions().length + 1)
            {
               $(this).closest('li').remove();
               $parentUl.listview('refresh');
            }
            else
            {
               navigator.notification.alert(
                  'Position not deleted. Something gone wrong so please try again.',
                  function(){},
                  'Error'
               );
            }
 
         }
      );
      // Append the link to the <li> element
      $listElement.append($linkElement);
 
      // Append the <li> element to the <ul> element
      $('#' + idElement).append($listElement);
   }
   $('#' + idElement).listview('refresh');
}