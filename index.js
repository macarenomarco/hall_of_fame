var spreadSheetId = '1beCDG5iP6lyAQLXshzF7mNAl1MeazsI1NEaWBDxjwrg';
var API_KEY = 'AIzaSyBRlQRP-s64D_OTDPvBJVeudRH0On0L66w';
var range = 'Preparatoria!A1:J25';

var table = document.getElementById('resultados');

fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadSheetId + '/values/' + range + '?key=' + encodeURIComponent(API_KEY))
    .then(function (response) {
        response.json()
            .then(function (jsonResponse) {
                jsonResponse.values.forEach(function (row, i) {
                    var isHeader = false;
                    if (i === 0) {
                        isHeader = true;
                    }

                    var cellTag = 'td';
                    if (isHeader) {
                        cellTag = 'th';
                    }

                    var rowTag = document.createElement('tr');

                    row.forEach(function (cellContents) {
                        var cell = document.createElement(cellTag);
                        cell.innerText = cellContents;
                        rowTag.appendChild(cell);
                    });

                    table.appendChild(rowTag);
                });
            });
    })