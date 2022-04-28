"use strict";
exports.__esModule = true;
var react_datepicker_1 = require("react-datepicker");
var date_fns_1 = require("date-fns");
var DateInputButton_1 = require("./DateInputButton");
function DateInput(_a) {
    var _b = _a.isRange, isRange = _b === void 0 ? false : _b, date = _a.date, startDate = _a.startDate, endDate = _a.endDate, onChange = _a.onChange;
    return (React.createElement("div", { className: "relative" },
        React.createElement(react_datepicker_1["default"], { selected: date, onChange: onChange, selectsStart: true, startDate: startDate, endDate: endDate, nextMonthButtonLabel: ">", previousMonthButtonLabel: "<", popperClassName: "react-datepicker-left", customInput: React.createElement(DateInputButton_1["default"], null), renderCustomHeader: function (_a) {
                var date = _a.date, decreaseMonth = _a.decreaseMonth, increaseMonth = _a.increaseMonth, prevMonthButtonDisabled = _a.prevMonthButtonDisabled, nextMonthButtonDisabled = _a.nextMonthButtonDisabled;
                return (React.createElement("div", { className: "flex items-center justify-between px-2 py-2" },
                    React.createElement("span", { className: "text-lg text-gray-700" }, date_fns_1.format(date, "MMMM yyyy")),
                    React.createElement("div", { className: "space-x-2" },
                        React.createElement("button", { onClick: decreaseMonth, disabled: prevMonthButtonDisabled, type: "button", className: "\n                                            " + (prevMonthButtonDisabled && "cursor-not-allowed opacity-50") + "\n                                            inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500\n                                        " },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-600", viewBox: "0 0 20 20", fill: "currentColor" },
                                React.createElement("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }))),
                        React.createElement("button", { onClick: increaseMonth, disabled: nextMonthButtonDisabled, type: "button", className: (nextMonthButtonDisabled && "cursor-not-allowed opacity-50") + " inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500\n                " },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-600", viewBox: "0 0 20 20", fill: "currentColor" },
                                React.createElement("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }))))));
            } })));
}
exports["default"] = DateInput;
