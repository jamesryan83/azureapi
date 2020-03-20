
var app = app || {};


// Ajax functions
app.ajax = {

    apiManagementUrl: "https://logicexamplejr.azure-api.net/api",


    // Blob storage

    getImages: function (callback) {
        $.ajax({
            method: "GET",
            url: this.apiManagementUrl + "/images",
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                console.log(err);
                alert("Error getting images");
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
                console.log(err);
                alert("Error uploading image");
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
                console.log(err);
                alert("Error getting row data");
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
                console.log(err);
                alert("Error creating row");
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
                console.log(err);
                alert("Error creating csv");
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
                alert("MessageCreated");
                callback();
            },
            error: function (err) {
                console.log(err);
                alert("Error creating service bus message");
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
                console.log(err);
                alert("Error getting service bus messages");
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
                console.log(err);
                alert("Error using OCR on image");
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
                console.log(err);
                alert("Error resetting data");
            }
        });
    }
}