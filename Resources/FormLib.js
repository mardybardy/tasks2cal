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
        APP: {
            FANTASTICAL: {
                label: "Fantastical",
                index: 0,
            },
            BUSYCAL: {
                label: "BusyCal",
                index: 1,
            },
            TIM: {
                label: "Tim",
                index: 2
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
        },
        HIERARCHY: {
            CHILDREN: {
                label: "Tasks with no children.",
                index: 0,
            },
            DEPTH: {
                label: "Lowest task at or above specified depth.",
                index: 1,
            },
            ALL: {
                label: "All tasks.",
                index: 2
            }
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

	getAppField = function () {
        const { C: { APP }} = lib;
        const index = preferences.readNumber("app") ?? APP.FANTASTICAL.index;
        const { menuItems, menuIndexes } = getItemsAndIndexes(APP);

        return new Form.Field.Option(
            'app',
            'App',
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

    getMaxDepthField = function() {
        const depth = preferences.readString("maxDepth") ?? "0";
        
        return new Form.Field.String(
            "maxDepth",
            "Maximum Task Depth",
            depth,
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

    getTimField = function() {
        const tim = preferences.readBoolean("tim") ?? false;

        return new Form.Field.Checkbox(
            "tim",
            "Also Add To Tim",
            tim
        )
    };

    getTaskHierarchyField = function() {
        const index = preferences.readNumber("taskHierarchy") ?? 0;

        const { menuItems, menuIndexes } = getItemsAndIndexes(lib.C.HIERARCHY);

        return new Form.Field.Option(
            "taskHierarchy", 
            "Only include", 
            menuIndexes, 
            menuItems, 
            index,
        )
    }

    getFields = () => {
        const { C: { TIME_WINDOW: { START, END } }} = lib;

        const fields = [
            getDateField(START),
            getDateField(END),
            getAppField(),
            getAddAsTasksField(),
            getMaxDepthField(),
            getTaskHierarchyField(),
            getDurationField(),
            getUnestimatedField(),
            getSurplusBehaviourField(),
        ];

        if (!Device.current.iOS) {
            fields.splice(3, 0, getTimField())
        }

        return fields;
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

        form.validate = function ({ values: { startDate, endDate, defaultDuration, app, maxDepth }}) {
            const today = new Date().setHours(0,0,0,0);

            if (Device.current.iOS && (app === lib.C.APP.BUSYCAL.index || app === lib.C.APP.TIM.index)) {
                throw `${app} unsupported on iOS. Try on Mac.`
            } else if (startDate.getTime() <= today || endDate.getTime() <= today) {
                throw "Please select a date that is not in the past."
            } else if (endDate.getTime() <= startDate.getTime()) {
                throw "Please ensure end date is after start date."
            } else if (
                +defaultDuration === NaN 
                || !Number.isInteger(Number(defaultDuration)) 
                || Number(defaultDuration) < 1
            ) {
                throw "Only positive integers are valid."
            } else if (
                +maxDepth === NaN 
                || !Number.isInteger(Number(maxDepth)) 
                || Number(maxDepth) < 0
            ) {
                throw "Only zero or positive integers are valid."
            } else {
                return true;
            }
        }

        return form;
    };

	return lib;
})();
