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
                label: "Fantastical",
                index: 0,
            },
            BUSYCAL: {
                label: "BusyCal",
                index: 1,
            }
        },
        UNESTIMATED: {
            EVENT: {
                label: "Added as events with the default duration.",
                index: 0
            },
            TASK: {
                label: "Added as unscheduled tasks.",
                index: 1
            },
            IGNORE: {
                label: "Ignored.",
                index: 2
            },
        }
    };

    getItemsAndIndexes = (obj) => {
        const menuItems = [];
        const menuIndexes = [];

        for ( const { label, index} of Object.values(obj)) {
            menuItems[index] = label;
            menuIndexes[index] = index;
        }

        return { menuItems, menuIndexes };
    };

	getCalField = function () {
        const { C: { CAL_APP }} = lib;
        const index = preferences.readNumber("cal") ?? CAL_APP.FANTASTICAL.index;
        const { menuItems, menuIndexes } = getItemsAndIndexes(CAL_APP);

        return new Form.Field.Option(
            'cal',
            'Calendar App',
            menuIndexes,
            menuItems,
            index,
        );
    };

    getSurplusBehaviourField = function () {
        const { C: { SURPLUS }} = lib;
        const index = preferences.readNumber("surplusBehaviour") ?? SURPLUS.NONE.index;
        const  { menuItems, menuIndexes } = getItemsAndIndexes(SURPLUS);

        return new Form.Field.Option(
            'surplusBehaviour',
            'If Total Task Duration Exceeds Time Available',
            menuIndexes,
            menuItems,
            index
        );
    };

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
    };

    getDurationField = function() {
        const duration = preferences.readString("defaultDuration") ?? "20";
        
        return new Form.Field.String(
            "defaultDuration",
            "Default Duration (minutes)",
            duration,
        );
    };

    getUnestimatedField = function() {
        const index = preferences.readNumber("unestimated") ?? 0;

        const { menuItems, menuIndexes } = getItemsAndIndexes(lib.C.UNESTIMATED);

        return new Form.Field.Option(
            "unestimated", 
            "Unestimated Tasks Should Be", 
            menuIndexes, 
            menuItems, 
            index,
        )
    };

    getAddAsTasksField = function() {
        const addAsTasks = preferences.readBoolean("addAsTasks") ?? false;

        return new Form.Field.Checkbox(
            "addAsTasks",
            "Add As Tasks (Not Events)",
            addAsTasks
        )
    };

    getFields = () => {
        const { C: { TIME_WINDOW: { START, END } }} = lib;

        return [
            getDateField(START),
            getDateField(END),
            getCalField(),
            getAddAsTasksField(),
            getDurationField(),
            getUnestimatedField(),
            getSurplusBehaviourField(),
        ];
    };

    createForm = () => {
        const form = new Form();

        for (const field of getFields()) {
            form.addField(field);
        }

        return form;
    };

    lib.savePreferences = function (form) {
        for (const [key, value] of Object.entries(form.values)) {
            preferences.write(key, value);
        }
    };

    lib.getForm = () => {
        const form = createForm();

        form.validate = function ({ values: { startDate, endDate, defaultDuration, cal }}) {
            const today = new Date().setHours(0,0,0,0);
            
            if (Device.current.iOS && cal === lib.C.CAL_APP.BUSYCAL.index) {
                throw "BusyCal unsupported on iOS. Try on Mac."
            } else if (startDate.getTime() <= today || endDate.getTime() <= today) {
                throw "Please select a date that is not in the past."
            } else if (endDate.getTime() <= startDate.getTime()) {
                throw "Please ensure end date is after start date."
            } else if (+defaultDuration === NaN) {
                throw "Only numbers are valid."
            } else {
                return true;
            }
        }

        return form;
    };

	return lib;
})();
