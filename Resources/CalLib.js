/* global PlugIn Version*/
(() => {
    const lib = new PlugIn.Library(new Version("1.0"));
    const MILLISECONDS_IN_MINUTE = 60000;

    addZeroForSingleDigit = function(num) {
        return num < 10 
            ? `0${num}`
            : `${num}`;
    }

    getTimeFromDate = function(date) {
        const hours = addZeroForSingleDigit(date.getHours());
        const mins = addZeroForSingleDigit(date.getMinutes());
        
        return `${hours}:${mins}`
    }

    getHyphenatedDate = function(date) {
        const days = addZeroForSingleDigit(date.getDate());
        const year = date.getFullYear();
        const month = addZeroForSingleDigit(date.getMonth() + 1);
        
        return `${year}-${month}-${days}`;
    }

    getDateInstructions = function(date, duration) {
        const newDateTime = getDateWithAddedDuration(date, duration);
        const hyphenatedDate = getHyphenatedDate(date);
        const start = getTimeFromDate(date);
        const end = getTimeFromDate(newDateTime);

        return `on ${hyphenatedDate} ${start} to ${end}`;
    }

    getTaskLinkStr = function(task) {
        return `omnifocus:///task/${task.id.primaryKey}`
    }


    getFantasticalStr = function(task, encodedStr, { values: { addAsTasks }}) {
        const taskLink = getTaskLinkStr(task);
        const notes = task.note.length 
            ? encodeURIComponent(`${task.note}\n\n${taskLink}`) 
            : `${taskLink}`;
        const asTask = addAsTasks ? `task%20` : '';

        return `x-fantastical3://parse?add=1&n=${notes}&s=${asTask}${encodedStr}`;
    }

    getBusyCalStr = function(task, encodedStr, { values: { addAsTasks }}) {
        const taskLink = encodeURIComponent(`<${getTaskLinkStr(task)}>`);
        const notes = encodeURIComponent(task.note ?? '');
        const asTask = addAsTasks ? `-%20` : '';
        return `busycalevent://new/${asTask}${encodedStr}${taskLink}/${notes}`;
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
        return Number(estimatedMinutes 
            ? estimatedMinutes 
            : defaultDuration
        ) * MILLISECONDS_IN_MINUTE;
    }

    durationGTEWindow = function(date, duration, form) {
        const { values: { endDate }} = form;

        const newDate = getDateWithAddedDuration(date, duration);

        return newDate.getTime() >= endDate.getTime();
    }

    lib.getNextDate = function(task, date, form, formLib, taskDurationCutoff) {
        const { C: { SURPLUS: { NONE, SQUASH, ADD }}} = formLib;
        const { values: { surplusBehaviour }} = form;

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
        const dateInstructions = form.values.addAsTasks 
            ? `${getHyphenatedDate(date)} ${getTimeFromDate(date)}`
            : getDateInstructions(date, duration);
        const encodedStr = encodeURIComponent(`${task.name} ${dateInstructions}`);

        return form.values.cal === FANTASTICAL.index
            ? getFantasticalStr(task, encodedStr, form)
            : getBusyCalStr(task, encodedStr, form);

    }

    return lib;
})();