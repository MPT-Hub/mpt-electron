fs = require("fs");       // Filesystem module
const { dialog } = require("electron").remote;  // Dialog module

var path = require("path")
const mainPy = path.resolve(__dirname, '../res', 'mpt.py');

document.getElementById("dataFile").onclick = () => {
    dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
            console.log("No files were selected");
        } else {
            getData(fileNames[0]);
        }
    });
};

function getFormatedTime(date) {
    h = date.getUTCHours().toString().padStart(2, "0");
    m = date.getUTCMinutes().toString().padStart(2, "0");
    s = date.getUTCSeconds().toString().padStart(2, "0");

    formatedTime = h + ':' + m + ':' + s

    return formatedTime
};

function getData(filePath) {
    var { PythonShell } = require("python-shell")

    var startDate = new Date();
    strDate = getFormatedTime(startDate)
    document.getElementById("start").innerText = strDate
    document.getElementById('l-start').classList.remove("d-none")

    var options = {
        args: [filePath]
    }

    var data = new PythonShell(mainPy, options);

    console.log(data)

    data.on('message', function (trajectories) {
        $.makeTable = function (mydata) {
            var table = $('<table class="table table-hover table-striped text-center">');
            var tblHeader = '<thead><tr class="table-primary">';
            for (var k in mydata[0]) tblHeader += '<th>' + getHeader(k) + '</th>';
            tblHeader += "</tr></thead><tbody>";
            $(tblHeader).appendTo(table);
            $.each(mydata, function (index, value) {
                var TableRow = "<tr>";
                $.each(value, function (key, val) {
                    TableRow += '<td>' + val.toFixed(10) + '</td>';
                });
                TableRow += "</tbody></tr>";
                $(table).append(TableRow);
            });

            var endDate = new Date();
            strDate = getFormatedTime(endDate)
            document.getElementById("end").innerText = strDate
            document.getElementById('l-end').classList.remove("d-none")

            var elapsedTime = new Date(endDate - startDate);
            strDate = getFormatedTime(elapsedTime)
            document.getElementById("duration").innerText = strDate
            document.getElementById('l-duration').classList.remove("d-none")

            return ($(table));
        };

        function getHeader(pyHeader) {

            var header = ""

            switch (pyHeader) {
                case "tau":
                    header = "Timescale";
                    break;
                case "msdp":
                    header = "MSD (pixel<sup>2</sup>)";
                    break;
                case "msdm":
                    header = "MSD (&mu;m<sup>2</sup>)";
                    break;
                case "deffp":
                    header = "D<sub>eff</sub> (pixel<sup>2</sup>)";
                    break;
                case "deffm":
                    header = "D<sub>eff</sub> (&mu;m<sup>2</sup>)";
                    break;
                default:
                    header = pyHeader;
            }

            return header
        }

        var mydata = eval(JSON.parse(trajectories));
        var table = $.makeTable(mydata);
        $(table).appendTo("#imported");
        // -----------------------------------------------------------------
    })
}