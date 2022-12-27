/* global PlugIn Version*/
(() => {
    const lib = new PlugIn.Library(new Version("1.0"));
    const MILLISECONDS_IN_MINUTE = 60000;

    addZeroForSingleDigit = function(num) {
        return num < 10 
            ? `0${num}`
            : `${num}`;
    }

    getDateInstructions = function(date, duration) {
        const newDateTime = getDateWithAddedDuration(date, duration);

        const days = addZeroForSingleDigit(date.getDate());
        const year = date.getFullYear();
        const month = addZeroForSingleDigit(date.getMonth() + 1);
        const formattedDate = `${year}-${month}-${days}`;
        
        const startHours = addZeroForSingleDigit(date.getHours());
        const startMins = addZeroForSingleDigit(date.getMinutes());
        const start = `${startHours}:${startMins}`

        const endHours = addZeroForSingleDigit(newDateTime.getHours());
        const endMins = addZeroForSingleDigit(newDateTime.getMinutes())
        const end = `${endHours}:${endMins}`

        return `on ${formattedDate} ${start} to ${end}`;
    }

    getTaskLinkStr = function(task) {
        return `omnifocus:///task/${task.id.primaryKey}`
    }

    getFantasticalStr = function(task, encodedStr) {
        const taskLink = getTaskLinkStr(task);

        return `x-fantastical3://parse?add=1&n=${taskLink}&s=${encodedStr}`;
    }

    getBusyCalStr = function(task, encodedStr) {
        const taskLink = encodeURIComponent(`<${getTaskLinkStr(task)}>`);

        return `busycalevent://new/${encodedStr}${taskLink}`;
    }

    getDateWithAddedDuration = function(prev, duration) {
        return new Date(prev.getTime() + duration);
    }

    getDuration = function (task, date, form, formLib, taskDurationCutoff) {
        const { estimatedMinutes } = task;
        const { values: { surplusBehaviour, endDate }} = form;
        const { C: { SURPLUS: { NONE, SQUASH }}} = formLib;
        
        let result = lib.getDurationOrFallbackToDefault(task, form);

        if (
            NONE.index === surplusBehaviour
            && durationGTEWindow(date, result, form)
        ) {
            result = endDate.getTime() - date.getTime();
        } else if (
            SQUASH.index === surplusBehaviour 
            && result > taskDurationCutoff
        ) {
            result = taskDurationCutoff;
        }

        return result;
    }

    lib.getDurationOrFallbackToDefault = function (
        { estimatedMinutes }, 
        { values: { defaultDuration }}
    ) {
        return estimatedMinutes
            ? Number(estimatedMinutes) * MILLISECONDS_IN_MINUTE
            : Number(defaultDuration) * MILLISECONDS_IN_MINUTE;
    }

    durationGTEWindow = function(date, duration, form) {
        const { values: { endDate }} = form;

        const newDate = getDateWithAddedDuration(date, duration);

        return newDate.getTime() >= endDate.getTime();
    }

    lib.getNextDate = function(task, date, form, formLib, taskDurationCutoff) {
        const { C: { SURPLUS: { NONE, SQUASH, ADD }}} = formLib;
        const { values: { surplusBehaviour }} = form

        const unadjustedDuration = lib.getDurationOrFallbackToDefault(task, form);
        const duration = getDuration(task, date, form, formLib, taskDurationCutoff);
        const newDate = getDateWithAddedDuration(date, duration);

        let result;

        if (
            ADD.index === surplusBehaviour
            || SQUASH.index === surplusBehaviour
            || (
                NONE.index === surplusBehaviour
                && !durationGTEWindow(date, unadjustedDuration, form)
            )
        ) {
            result = newDate;
        }

        return result;
    }

    lib.getCalStr = function(task, date, form, formLib, taskDurationCutoff) {
        const { C: { CAL_APP: { FANTASTICAL }}} = formLib;
        const duration = getDuration(task, date, form, formLib, taskDurationCutoff);
        const dateInstructions = getDateInstructions(date, duration);
        const encodedStr = encodeURIComponent(`${task.name} ${dateInstructions}`);

        return form.values.cal === FANTASTICAL.index
            ? getFantasticalStr(task, encodedStr)
            : getBusyCalStr(task, encodedStr);
    }

    return lib;
})();