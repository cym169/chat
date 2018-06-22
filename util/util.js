/*
* @Author: chen
* @Date:   2018/4/13
*/
'use strict';

var util = {
    formatDateLocale: function (ts) {
        var a = new Date(ts * 1000);
        var month = a.getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = "0" + month;
        }
        var day = a.getDate();
        if (parseInt(day, 10) < 10) {
            day = "0" + day;
        }
        var hours = a.getHours();
        if (parseInt(hours, 10) < 10) {
            hours = "0" + hours;
        }
        var min = a.getMinutes();
        if (parseInt(min, 10) < 10) {
            min = "0" + min;
        }
        var sec = a.getSeconds();
        if (parseInt(sec, 10) < 10) {
            sec = "0" + sec;
        }
        return a.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + min + ":" + sec;
    },
    formatDate: function (ts) {
        var a = new Date(ts);
        var month = a.getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = "0" + month;
        }
        var day = a.getDate();
        if (parseInt(day, 10) < 10) {
            day = "0" + day;
        }
        var hours = a.getHours();
        if (parseInt(hours, 10) < 10) {
            hours = "0" + hours;
        }
        var min = a.getMinutes();
        if (parseInt(min, 10) < 10) {
            min = "0" + min;
        }
        var sec = a.getSeconds();
        if (parseInt(sec, 10) < 10) {
            sec = "0" + sec;
        }
        return a.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + min + ":" + sec;
    },
    formatDateWithoutS: function (ts) {
        var a = new Date(ts);
        var month = a.getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = "0" + month;
        }
        var day = a.getDate();
        if (parseInt(day, 10) < 10) {
            day = "0" + day;
        }
        return a.getFullYear() + "-" + month + "-" + day;
    }
};

module.exports = util;