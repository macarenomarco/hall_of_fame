var HallOfFameApi = function (apiKey, spreadSheetId) {
    var getData = function (range) {
        return fetch(
            'https://sheets.googleapis.com/v4/spreadsheets/' + 
            spreadSheetId + 
            '/values/' + 
            range + 
            '?key='+encodeURIComponent(apiKey)
        ).then(function (response) {
            if (response.status === 200) {
                return response.json();
            }
        });
    };

    this.getOlimpiadas = function () {
        return getData('Olimpiadas!A:A')
            .then(function (response) {
                return response.values;
            })
            .then(function (rows) {
                return rows.map(function (row) {return row[0]});
            });
    };
};

var getEnv = function (defaultEnv) {
    return fetch('dev.env.json')
        .then(function (resp) {
            if (resp.status === 200) {
                return resp.json();
            }
            
            return defaultEnv;
        });
};


var API_KEY = 'AIzaSyBRlQRP-s64D_OTDPvBJVeudRH0On0L66w';
var table = document.getElementById('resultados');
var tableHeader = table.querySelector('thead');
var tableBody = table.querySelector('tbody');

var olimpiadaSelect = document.getElementById('olimpiadas')

var spreadSheetId = '1aTG1lp__BLsUfchFs1CJkWRVUDyswXonNXq_TRKgjmk';

google.charts.load('current');
google.charts.setOnLoadCallback(function () {
    getEnv({
        GOOGLE_API_KEY: API_KEY,
    }).then(function (env) {
        var apiKey = env.GOOGLE_API_KEY;
        var api = new HallOfFameApi(apiKey, spreadSheetId);
        var cache = {};

        function uiRefreshOlimpiadaResults(rawData) {
            tableHeader.innerHTML = '';
            tableBody.innerHTML = '';

            var headerRow = document.createElement('tr');
            rawData.cols.forEach(function (colModel) {
                var th = document.createElement('th');
                th.innerText = colModel.label;
                headerRow.appendChild(th);
            });
            tableHeader.appendChild(headerRow);

            rawData.rows.forEach(function (rowData) {
                var row = document.createElement('tr');

                rowData.c.forEach(function (cellData) {
                    var td = document.createElement('td');
                    td.innerText = cellData.v;

                    row.appendChild(td);
                });

                tableBody.appendChild(row);
            });
        }

        function refreshOlimpiadaResults() {
            var currentOlimpiada = olimpiadaSelect.options[olimpiadaSelect.selectedIndex].value;
            var query = 'select A, B, C, D, H WHERE A = "' + currentOlimpiada + '"';

            if (cache.hasOwnProperty(query)) {
                return uiRefreshOlimpiadaResults(cache[query]);
            }

            var queryObj = new google.visualization.Query(
                'https://docs.google.com/spreadsheets/d/'+spreadSheetId+'/gviz/tq?sheet=Resultados&headers=1&tq=' + encodeURIComponent(query));
            queryObj.send(function(response) {
                var rawData =  JSON.parse(response.getDataTable().toJSON());

                cache[query] = rawData;
                
                return uiRefreshOlimpiadaResults(rawData);
            });
        }

        olimpiadaSelect.addEventListener('change', function () {
            refreshOlimpiadaResults();
        });

        api.getOlimpiadas()
            .then(function(olimpiadas) {
                olimpiadas.forEach(function (olimpiadaName) {
                    var option = document.createElement('option');
                    option.innerText = olimpiadaName;
                    option.value = olimpiadaName;

                    olimpiadaSelect.appendChild(option);
                });
            })
            .then(refreshOlimpiadaResults);
    });
});
