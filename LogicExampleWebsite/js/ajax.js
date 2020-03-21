
var app = app || {};


// Ajax functions
app.ajax = {

    apiManagementUrl: "https://logicexamplejr.azure-api.net/api",
    searchUrl: "https://logicexample.search.windows.net/indexes/logicexample-index/docs?api-version=2019-05-06&search=",


    // Blob storage

    getImages: function (callback) {
        $.ajax({
            method: "GET",
            url: this.apiManagementUrl + "/images",
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error getting images");
            }
        });
	},

    uploadImage: function (imageData, callback) {
        $.ajax({
            method: "POST",
            url: this.apiManagementUrl + "/image",
            data: imageData,
            contentType: false,
            processData: false,
            success: function (res) {
                callback();
            },
            error: function (err) {
                app.ajax.onError(err, "Error uploading image");
			}
        });
    },



    // SQL Database

    getRows: function (callback) {
        $.ajax({
            method: "GET",
            url: this.apiManagementUrl + "/rows",
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error getting row data");
            }
        })
    },

    createRow: function (rowData, callback) {
        $.ajax({
            method: "POST",
            url: this.apiManagementUrl + "/row",
            data: JSON.stringify(rowData),
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error creating row");
            }
        });
    },

    getCsv: function (callback) {
        $.ajax({
            method: "GET",
            url: this.apiManagementUrl + "/csv",
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error creating csv");
            }
        });
    },


    // Service Bus

    createSbMessage: function (message, callback) {
        $.ajax({
            method: "POST",
            url: this.apiManagementUrl + "/sbmessage",
            data: message,
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error creating service bus message");
            }
        });
    },

    getSbMessages: function (callback) {
        $.ajax({
            method: "GET",
            url: this.apiManagementUrl + "/sbmessages",
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error getting service bus messages");
            }
        });
    },



    // Other

    imageOcr: function (imagePath, callback) {
        $.ajax({
            method: "POST",
            url: this.apiManagementUrl + "/ocr",
            contentType: "application/json",
            data: JSON.stringify({ "imageUrl": imagePath }),
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                app.ajax.onError(err, "Error using OCR on image");
            }
        });
    },

    azureSearch: function (searchTerm, callback) {
        $.ajax({
            method: "GET",
            url: this.searchUrl + searchTerm,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("api-key", "EC05C9CFEAC61259BBCAB3C476409044");
            },
            success: function (res) {
                callback(res);
            },
            error: function(err) {
                app.ajax.onError(err, "Error performing search");
            }
        });
    },

    reset: function (db, blob, callback) {
        $.ajax({
            method: "POST",
            url: this.apiManagementUrl + "/reset",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ "db": db, "blob": blob }),
            success: function (res) {
                callback();
            },
            error: function (err) {
                app.ajax.onError(err, "Error resetting data");
            }
        });
    },

    onError: function (err, message) {
        console.log(err);
        alert(message);
        app.main.hideLoadingScreen();
    }
}