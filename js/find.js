      var map, places, infoWindow;
      var markers = [];
      var autocomplete;
      var countryRestrict = {
          'country': 'es' //set default country
      };
      var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
      var hostnameRegexp = new RegExp('^https?://.+?/');
      let lat, lng, place;
      let arrPhoto_url = [];
      var countries = {

          'ie': {
              center: {
                  lat: 53,
                  lng: -7.6
              },
              zoom: 6
          },
          'au': {
              center: {
                  lat: -25.3,
                  lng: 133.8
              },
              zoom: 4
          },
          'br': {
              center: {
                  lat: -14.2,
                  lng: -51.9
              },
              zoom: 3
          },
          'ca': {
              center: {
                  lat: 62,
                  lng: -110.0
              },
              zoom: 3
          },
          'fr': {
              center: {
                  lat: 46.2,
                  lng: 2.2
              },
              zoom: 5
          },
          'de': {
              center: {
                  lat: 51.2,
                  lng: 10.4
              },
              zoom: 5
          },
          'mx': {
              center: {
                  lat: 23.6,
                  lng: -102.5
              },
              zoom: 4
          },
          'nz': {
              center: {
                  lat: -40.9,
                  lng: 174.9
              },
              zoom: 5
          },
          'it': {
              center: {
                  lat: 41.9,
                  lng: 12.6
              },
              zoom: 5
          },
          'za': {
              center: {
                  lat: -30.6,
                  lng: 22.9
              },
              zoom: 5
          },
          'es': {
              center: {
                  lat: 40.5,
                  lng: -3.7
              },
              zoom: 5
          },
          'pt': {
              center: {
                  lat: 39.4,
                  lng: -8.2
              },
              zoom: 6
          },
          'us': {
              center: {
                  lat: 37.1,
                  lng: -95.7
              },
              zoom: 3
          },
          'uk': {
              center: {
                  lat: 54.8,
                  lng: -4.6
              },
              zoom: 5
          },
          'pl': {
              center: {
                  lat: 51.9,
                  lng: 19.14
              },
              zoom: 5
          }

      };



      function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
              zoom: countries['es'].zoom,
              center: countries['es'].center,
              mapTypeControl: false,
              panControl: false,
              zoomControl: false,
              streetViewControl: false
          });

          infoWindow = new google.maps.InfoWindow({
              content: document.getElementById('info-content')
          });

          // Create the autocomplete object and associate it with the UI input control.
          // Restrict the search to the default country, and to place type "cities".
          autocomplete = new google.maps.places.Autocomplete(
              /** @type {!HTMLInputElement} */
              (
                  document.getElementById('autocomplete')), {
                  types: ['(cities)'],
                  componentRestrictions: countryRestrict
              });
          places = new google.maps.places.PlacesService(map);

          autocomplete.addListener('place_changed', onPlaceChanged);

          // Update lat/long value of div when anywhere in the map is clicked  
          google.maps.event.addListener(map, 'click', function (event) {
              search.bounds = event.latLng
              lat = event.latLng.lat()
              lng = event.latLng.lng()
              


              map.setCenter({
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng()
              });
              search()
              //map.setZoom(8);
          });
          //////////////////////////////////
          // Add a DOM event listener to react when the user selects a country.
          document.getElementById('country').addEventListener(
              'change', setAutocompleteCountry);

          //Dont show the results on the begining:
          document.getElementById("gresults").style = "display:none;"
          document.getElementById("info-content").style = "display:none;"
      }




      // When the user selects a city, get the place details for the city and
      // zoom the map in on the city.
      function onPlaceChanged() {
          place = autocomplete.getPlace();
          if (place.geometry) {
              map.panTo(place.geometry.location);
              map.setZoom(15);
              

              search();
          } else {
              document.getElementById('autocomplete').placeholder = 'Enter a city';
          }
      }


      // Search for types:['museum'] in the selected city, within the viewport of the map.

      function search() {
          document.getElementById("gresults").style = "display:static;"

          let search = {
              bounds: map.getBounds(),
              types: ['cafe']
          };

          if (document.getElementById("Museum").checked) search.types[0] = 'museum';
          if (document.getElementById("Restaurant").checked) search.types[0] = 'restaurant';
          if (document.getElementById("Cafe").checked) search.types[0] = 'cafe';
          if (document.getElementById("Spa").checked) search.types[0] = 'spa';



          places.nearbySearch(search, function (results, status) {

              //if there is no results inform user about that
              if (results.length == 0) {
                  document.getElementById("konsole").innerHTML = ' <p  class="alert alert-info" role="alert"> Nothing to show here - click somwhere else on the map </p>'
                  document.getElementById("gresults").style = "display:none;";
                  document.getElementById("info-content").style = "display:none;";
                  clearResults();
                  clearMarkers();
              } else document.getElementById("konsole").innerHTML = '';

              if (status === google.maps.places.PlacesServiceStatus.OK) {
                  clearResults();
                  clearMarkers();
                  // Create a marker for each attraction found, and
                  // assign a letter of the alphabetic to each marker icon.
                  for (var i = 0; i < results.length; i++) {
                      var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                      var markerIcon = MARKER_PATH + markerLetter + '.png';
                      // Use marker animation to drop the icons incrementally on the map.
                      markers[i] = new google.maps.Marker({
                          position: results[i].geometry.location,
                          animation: google.maps.Animation.DROP,
                          icon: markerIcon
                      });
                      // If the user clicks a attraction marker, show the details of that hotel
                      // in an info window.

                      markers[i].placeResult = results[i];
                      google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                      setTimeout(dropMarker(i), i * 100);
                      addResult(results[i], i);
                  }
              }
          });
      }

      function clearMarkers() {
          for (var i = 0; i < markers.length; i++) {
              if (markers[i]) {
                  markers[i].setMap(null);
              }
          }
          markers = [];
      }

      // Set the country restriction based on user input.
      // Also center and zoom the map on the given country.
      function setAutocompleteCountry() {
          var country = document.getElementById('country').value;
          if (country == 'all') {
              autocomplete.setComponentRestrictions({
                  'country': []
              });
              map.setCenter({
                  lat: 15,
                  lng: 0
              });
              map.setZoom(2);
          } else {
              autocomplete.setComponentRestrictions({
                  'country': country
              });
              map.setCenter(countries[country].center);
              map.setZoom(countries[country].zoom);
          }
          clearResults();
          document.getElementById("gresults").style = "display:none;"
          clearMarkers();
      }

      function dropMarker(i) {
          return function () {
              markers[i].setMap(map);
          };

      }

      function addResult(result, i) {
          var results = document.getElementById('results');
          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + '.png';

          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
          tr.onclick = function () {
              google.maps.event.trigger(markers[i], 'click');
          };

          var iconTd = document.createElement('td');
          var nameTd = document.createElement('td');
          var icon = document.createElement('img');
          icon.src = markerIcon;
          icon.setAttribute('class', 'placeIcon');
          icon.setAttribute('className', 'placeIcon');
          var name = document.createTextNode(result.name);
          iconTd.appendChild(icon);
          nameTd.appendChild(name);
          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          results.appendChild(tr);
      }

      function clearResults() {
          var results = document.getElementById('results');
          while (results.childNodes[0]) {
              results.removeChild(results.childNodes[0]);
          }
      }

      // Get the place details for a attraction. Show the information in an info window,
      // anchored on the marker for the hotel that the user selected.
      function showInfoWindow() {

          n=0; //reset photo to first
          var marker = this;
          places.getDetails({
                  placeId: marker.placeResult.place_id
              },
              function (place, status) {
                  if (status !== google.maps.places.PlacesServiceStatus.OK) {
                      return;
                  }
                  infoWindow.open(map, marker);
                  buildIWContent(place);

              });
      }

      // Load the place information into the HTML elements used by the info window.
      let n = 0;

      function prev() {
        if (n > 0) { n--; }
        console.log(n)
        document.getElementById("info-content").style = "display:static;"
        document.getElementById('photo').style = ' background-image: url("' + arrPhoto_url[n] + ' ");';

      }

      function next() {
          if (n < 9) {  n++; }
          console.log(n)
          document.getElementById("info-content").style = "display:static;"
          document.getElementById('photo').style = ' background-image: url("' + arrPhoto_url[n] + ' ");';
      }

      function buildIWContent(place) {

          //show picture of current attraction

          for (let i = 0; i < 10; i++) {
              arrPhoto_url[i] = place.photos[i].getUrl({
                  'maxWidth': 500,
                  'maxHeight': 500
              });
          }

          let photo_url = place.photos[n].getUrl({
              'maxWidth': 500,
              'maxHeight': 500
          })
          document.getElementById("info-content").style = "display:static;"

          document.getElementById('photo').style = ' background-image: url("' + photo_url + ' ");';
          ////
          document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
              'src="' + place.icon + '"/>';
          document.getElementById('iw-url').innerHTML = '<b><a target="_blank" href="' + place.url +
              '">' + place.name + '</a></b>';
          document.getElementById('iw-address').textContent = place.vicinity;

          if (place.formatted_phone_number) {
              document.getElementById('iw-phone-row').style.display = '';
              document.getElementById('iw-phone').textContent =
                  place.formatted_phone_number;
          } else {
              document.getElementById('iw-phone-row').style.display = 'none';
          }

          // Assign a five-star rating to the attraction, using a black star ('&#10029;')
          // to indicate the rating the attraction has earned, and a white star ('&#10025;')
          // for the rating points not achieved.
          if (place.rating) {
              var ratingHtml = '';
              for (var i = 0; i < 5; i++) {
                  if (place.rating < (i + 0.5)) {
                      ratingHtml += '&#10025;';
                  } else {
                      ratingHtml += '&#10029;';
                  }
                  document.getElementById('iw-rating-row').style.display = '';
                  document.getElementById('iw-rating').innerHTML = ratingHtml;
              }
          } else {
              document.getElementById('iw-rating-row').style.display = 'none';
          }

          // The regexp isolates the first part of the URL (domain plus subdomain)
          // to give a short URL for displaying in the info window.
          if (place.website) {
              var fullUrl = place.website;
              var website = hostnameRegexp.exec(place.website);
              if (website === null) {
                  website = 'http://' + place.website + '/';
                  fullUrl = website;
              }
              document.getElementById('iw-website-row').style.display = '';
              document.getElementById('iw-website').textContent = website;
          } else {
              document.getElementById('iw-website-row').style.display = 'none';
          }
      }