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

    getDateComponents = function(date, duration) {
        const newDate = getDateWithAddedDuration(date, duration);

        return {
            startDate: getHyphenatedDate(date),
            endDate: getHyphenatedDate(newDate),
            startTime: getTimeFromDate(date),
            endTime: getTimeFromDate(newDate),
        }

        return components
    }

    getTaskLinkStr = function(task) {
        return `omnifocus:///task/${task.id.primaryKey}`
    }

    getFantasticalStr = function(task, date, form, formLib, taskDurationCutoff) {
        const parameters = getFantasticalParameters(task, date, form, formLib, taskDurationCutoff);

        return `x-fantastical3://parse?${parameters}`
    }

    getFantasticalMobileStr = function(task, date, form, formLib, taskDurationCutoff) {
        const parameters = getFantasticalParameters(task, date, form, formLib, taskDurationCutoff);
        
        return `x-fantastical3://x-callback-url/parse?${parameters}&x-success=omnifocus&x-source=omnifocus`;
    }

    const getFantasticalNote = function(task) {
        const taskLink = getTaskLinkStr(task);
        const note = task.note.length 
            ? encodeURIComponent(`${task.note}\n\n`)
            : '';

        return `${note}${taskLink}`;
    }

    getFantasticalParameters = (task, date, form, formLib, taskDurationCutoff) => {
        const duration = getDuration(task, date, form, formLib, taskDurationCutoff);
        const { startDate, endDate, startTime, endTime } = getDateComponents(date, duration);
        const addImmediately = '&add=1';
       
        const { s, n } = Device.current.iOS 
            ? { s: 'sentence=', n: '&notes=' }
            : { s: 's=', n: '&n=' };
        
        const timing = form.values.addAsTasks
            ? `due ${startDate} ${startTime}`
            : `on ${startDate} ${startTime} to ${endTime}`

        const sentence = `${s}${encodeURIComponent(`${task.name} ${timing}`)}`;
        const note = `${n}${getFantasticalNote(task)}`;
        
        return `${sentence}${note}${addImmediately}`;
    }

    getBusyCalParameters = (task, date, form, formLib, taskDurationCutoff) => {
       const duration = getDuration(task, date, form, formLib, taskDurationCutoff);
        const { startDate, endDate, startTime, endTime } = getDateComponents(date, duration);
        const asTask = form.values.addAsTasks ? `- ` : '';
        const timing = ` on ${startDate} ${startTime} to ${endTime} `;
        const taskLink = `<${getTaskLinkStr(task)}>`;
        const sentence = encodeURIComponent(`${asTask}${task.name}${timing}${taskLink}`);
        const note = encodeURIComponent(task.note ?? '');
        
        return `${sentence}/${note}`;
    }

    getBusyCalStr = function(task, date, form, formLib, taskDurationCutoff) {
        const parameters = getBusyCalParameters(task, date, form, formLib, taskDurationCutoff);

        return `busycalevent://new/${parameters}`;
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

    durationGTEWindow = function(date, duration, form) {
        const { values: { endDate }} = form;

        const newDate = getDateWithAddedDuration(date, duration);

        return newDate.getTime() >= endDate.getTime();
    }

    getEncodedStr = (task, date, form, formLib, taskDurationCutoff) => {
        const duration = getDuration(task, date, form, formLib, taskDurationCutoff);
        const dateInstructions = form.values.addAsTasks 
            ? `${getHyphenatedDate(date)} ${getTimeFromDate(date)}`
            : getDateInstructions(date, duration);
        
        return encodeURIComponent(`${task.name} ${dateInstructions}`);

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

    lib.getCalStr = (task, date, form, formLib, taskDurationCutoff) => {
        const { C: { CAL_APP: { FANTASTICAL }}} = formLib;
        const params = [task, date, form, formLib, taskDurationCutoff]

        return form.values.cal === FANTASTICAL.index
            ? Device.current.iOS
                ? getFantasticalMobileStr(...params)
                : getFantasticalStr(...params)
            : getBusyCalStr(...params);
    }

    return lib;
})();
