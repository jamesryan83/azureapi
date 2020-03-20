"use strict";

var app = app || {};

$(document).ready(function () {
    app.main.init();
});


// Main
app.main = {

    blobStorageUrl: "https://logicexample.blob.core.windows.net",


    init: function () {
        var self = this;

        $("#reset-button").on("click", function () {
            self.resetTable();
        });

        $("#create-row-form").submit(function (event) {
            event.preventDefault();
            self.createRow();
        });

        $("#upload-image-button").click(function () {
            self.uploadImage();
        });

        $("#get-csv-button").click(function () {
            self.getCsv();
        });

        $("#create-sb-message-form").submit(function (event) {
            event.preventDefault();
            self.createSbMessage();
        });

        this.resetTable();
        this.addImagesToOutput();
        this.getSbMessages();
    },


    createRow: function () {
        var self = this;

        var name = $("#create-row-name-input").val().trim();
        var description = $("#create-row-description-input").val().trim();

        if (name === "") {
            alert("Please enter a name");
            return;
        }

        app.ajax.createRow({
            Name: name, Description: description
        }, function () {
            self.resetTable();
        });
    },

    uploadImage: function () {
        var data = new FormData();
        var files = $("#Image")[0].files[0];
        data.append("Image", files);

        app.ajax.uploadImage(data, function () {
            self.addImagesToOutput();
        });
    },

    getCsv: function() {
        app.ajax.getCsv(function (csv) {
            var csvStr = "<h5 class='mt-5'>SQL Data as CSV</h5>" +
                "<textarea style='height: 200px; width: 200px;' spellcheck=false>" + csv + "</textarea>";

            $("#csv-container").empty().append(csvStr);
        });
    },

    createSbMessage: function () {
        var msg = $("#create-sb-message-input").val().trim();

        if (msg === "") {
            alert("Please enter a message");
            return;
        }

        app.ajax.createSbMessage(msg, function (res) {
            console.log(res)
        });
    },



    addRowsToTableOutput: function (data) {
        var rows = "";
        for (var i = 0; i < data.length; i++) {
            rows += "<tr><td>" + data[i].name + "</td><td>" + data[i].description + "</td></tr>";
        }

        $("#table-body").empty().append(rows);
    },

    addImagesToOutput: function () {
        var self = this;

        app.ajax.getImages(function (blobs) {
            var images = "";
            for (var i = 0; i < blobs.length; i++) {
                images += '<img src="' + self.blobStorageUrl + '/images/' + blobs[i].Name + '" height="100" width="100"></img>';
            }
            $("#image-container").empty().append(images);
        });
    },

    getSbMessages: function () {
        app.ajax.getSbMessages(function(messages) {
            var msgs = "";

            for (var i = 0; i < messages.length; i++) {
                msgs += "<p>" + atob(messages[i].ContentData) + "</p>";
            }

            $("#sb-container").empty().append(msgs);
        });
    },



    resetTable: function () {
        var self = this;

        app.ajax.getRows(function (rows) {
            self.addRowsToTableOutput(rows);
        });
	},

    resetAll: function () {
        var self = this;

        if (confirm("This will reset all the data back to its original state")) {
            app.ajax.reset(true, true, true, function ()
            {
                alert("Reset complete");
                self.resetTable();
                self.addImagesToOutput();
            });
        }
    }


}
