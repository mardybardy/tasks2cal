/* global PlugIn Version*/
(() => {
	const lib = new PlugIn.Library(new Version("1.0"));

    const preferences = new Preferences();
	
    lib.C = {
        FORM_TITLE: "Set Preferences",
        CONFIRM_TITLE: "Confirm",
        SURPLUS: {
            NONE: {
                label: "Stop adding tasks when end date reached.",
                index: 0
            },
            SQUASH: {
                label: "Squash task durations to fit time window.",
                index: 1
            },
            ADD: {
                label: "Continue adding tasks past end date.",
                index: 2
            }
        },
        TIME_WINDOW: {
            START: 'start',
            END: 'end'
        },
        CAL_APP: {
            FANTASTICAL: {
                name: "Fantastical",
                index: 0,
            },
            BUSYCAL: {
                name: "BusyCal",
                index: 1,
            }
        }
    }

	getCalField = function () {
        const index = preferences.readNumber("cal") ?? lib.C.CAL_APP.FANTASTICAL.index;
        const menuItems = [];
        const menuIndexes = [];

        for (const { name, index } of Object.values(lib.C.CAL_APP)) {
            menuItems[index] = name;
            menuIndexes[index] = index;
        }

        return new Form.Field.Option(
            'cal',
            'Calendar App',
            menuIndexes,
            menuItems,
            index,
        );
    }

    getSurplusBehaviourField = function () {
        const index = preferences.readNumber("surplusBehaviour") ?? lib.C.SURPLUS.NONE.index;
        const menuItems = [];
        const menuIndexes = [];

        for ( const { label, index} of Object.values(lib.C.SURPLUS)) {
            menuItems[index] = label;
            menuIndexes[index] = index;
        }

        return new Form.Field.Option(
            'surplusBehaviour',
            'If Total Task Duration Exceeds Time Available',
            menuIndexes,
            menuItems,
            index
        );
    }

    getDateField = function (timeWindow) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        let date = timeWindow === lib.C.TIME_WINDOW.START
            ? preferences.readDate("startDate")
            : preferences.readDate("endDate");

        if (date) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            
            tomorrow.setHours(hours, minutes, 0, 0);
        } else if (timeWindow === lib.C.TIME_WINDOW.START) {
            tomorrow.setHours(8,0,0,0);
        } else {
            tomorrow.setHours(20,0,0,0);
        }

        const { key, label } = timeWindow === lib.C.TIME_WINDOW.START
            ? { key: 'startDate', label: 'Start Date' }
            : { key: 'endDate', label: 'End Date' };
        
        return new Form.Field.Date(
            key,
            label,
            tomorrow,
            null
        );
    }

    getDurationField = function() {
        const duration = preferences.readString("defaultDuration") ?? "20";
        
        return new Form.Field.String(
            "defaultDuration",
            "Default Duration (minutes)",
            duration,
        );
    }

    getIgnoreUnestimatedField = function() {
        const ignoreUnestimated = preferences.readBoolean("ignoreUnestimated") ?? false;

         return new Form.Field.Checkbox(
            "ignoreUnestimated",
            "Ignore Unestimated Tasks",
            ignoreUnestimated
        )
    }

    createForm = () => {
        const startDate = getDateField(lib.C.TIME_WINDOW.START);
        const endDate = getDateField(lib.C.TIME_WINDOW.END);
        const cal = getCalField();
        const defaultDuration = getDurationField();
        const ignoreUnestimated = getIgnoreUnestimatedField();
        const surplusBehaviour = getSurplusBehaviourField();
        
        const form = new Form();

        form.addField(cal);
        form.addField(startDate);
        form.addField(endDate);
        form.addField(defaultDuration);
        form.addField(ignoreUnestimated);
        form.addField(surplusBehaviour)

        return form;
    }

    lib.savePreferences = function (form) {
        const { 
            values: {
                startDate,
                endDate,
                cal,
                defaultDuration,
                surplusBehaviour,
                ignoreUnestimated
            }
        } = form;

        preferences.write("surplusBehaviour", surplusBehaviour);
        preferences.write("defaultDuration", defaultDuration);
        preferences.write("cal", cal);
        preferences.write("startDate", startDate);
        preferences.write("endDate", endDate);
        preferences.write("ignoreUnestimated", ignoreUnestimated)
        
        return form;    
    }

    lib.getForm = () => {
        const form = createForm();

        form.validate = function ({ values: { startDate, endDate, defaultDuration }}) {
            const today = new Date().setHours(0,0,0,0);
            
            if (startDate.getTime() <= today || endDate.getTime() <= today) {
                throw "Please select a date that is not in the past."
            } else if (+defaultDuration === NaN) {
                throw "Only numbers are valid."
            } else {
                return true;
            }
        }

        return form;
    }

	return lib;
})();