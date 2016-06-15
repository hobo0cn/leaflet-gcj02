#leaflet-gcj02#

An on-going plugin for leaflet with GCJ02 projection Map.

##install##
copy in your lib path.

##example##

 var wmsLayer = L.tileLayer.wms('http://your/wms/server/url', {
                  layers: layerName,
                  crs: $window.L.CRS.GCJ02,
                  }).addTo(map);