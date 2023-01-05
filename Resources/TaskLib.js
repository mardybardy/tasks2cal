(() => {
    const lib = new PlugIn.Library(new Version("1.0"));
    const MILLISECONDS_IN_MINUTE = 60000;

    function getTotalTaskTime(tasks, form, formLib, calLib) {
        let total = 0;

        for (const task of tasks) {
            total += calLib.getDurationOrFallbackToDefault(task, form);
        }

        return total;
    }

    function isValidProjectTask(task) {
        return !task.hasChildren 
                && task.taskStatus !== Task.Status.Dropped 
                && task.taskStatus !== Task.Status.Completed
    };

    function meetsPreferenceRequirements(
        task, 
        { values: { unestimated }}, 
        {C: {UNESTIMATED: { IGNORE, TASK }}},
    ) {
        return !task.estimatedMinutes && (unestimated === IGNORE.index || unestimated === TASK.index)
            ? false
            : true
    };

    function getProjectTasks(selection) {
        const tasks = new Set();

        for (const project of selection.projects) {
            for (const task of project.flattenedChildren) {
                if (isValidProjectTask(task)) {
                    tasks.add(task);
                }
            }
        }

        return tasks;
    }

    function getOtherTasks(selection) {
        const tasks = new Set();

        for (const task of selection.tasks) {
                tasks.add(task);
        }

        return tasks;
    }

    function getTagTasks(selection) {
        const tasks = new Set();

        for (const tag of selection.tags) {
            for (const task of tag.remainingTasks) {
                tasks.add(task);
            }
        }

        return tasks;
    }

    lib.getTaskDurationCutoff = function(tasks, form, formLib, calLib) {
        let taskDurationCutoff;

        if (formLib.C.SURPLUS.SQUASH.index === form.values.surplusBehaviour) {
            const totalTime = getTotalTaskTime(tasks, form, formLib, calLib);

            const availableTime = form.values.endDate.getTime() - form.values.startDate.getTime();

            if (totalTime > availableTime) {
                const averageTaskTime = availableTime / tasks.length;

                let availableMinusShortTasks = availableTime
                let shortTaskCount = 0;

                for (const task of tasks) {
                    const duration = task.estimatedMinutes
                        ? Number(task.estimatedMinutes) * MILLISECONDS_IN_MINUTE
                        : Number(form.values.defaultDuration) * MILLISECONDS_IN_MINUTE;

                    if (duration < averageTaskTime) {
                        availableMinusShortTasks -= duration;
                        shortTaskCount += 1;
                    }
                }

                taskDurationCutoff = availableMinusShortTasks / (tasks.length - shortTaskCount);
            }
        }

        return taskDurationCutoff;
    }

    function getAllTasks(selection) {
        const s = new Set([
            ...getProjectTasks(selection),
            ...getTagTasks(selection),
            ...getOtherTasks(selection)
        ]);

        return [...s.values()];
    }

    lib.getTasks = (selection, form, formLib) => {
        const tasks = getAllTasks(selection);

        return tasks.filter((task) => meetsPreferenceRequirements(task, form, formLib));
        
    }

    lib.getUnestimatedTasks = (selection) => {
        const tasks = getAllTasks(selection);

        return tasks.filter((task) => !task.estimatedMinutes);
    }

    return lib;
})();