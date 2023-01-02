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

    function getProjectTasks(selection) {
        const tasks = new Set();

        for (const project of selection.projects) {
            for (const task of project.flattenedChildren) {
                if (!task.hasChildren 
                    && task.taskStatus !== Task.Status.Dropped 
                    && task.taskStatus !== Task.Status.Completed
                ) {
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

    lib.getTasksList = function(selection) {
        const s = new Set([
            ...getProjectTasks(selection),
            ...getTagTasks(selection),
            ...getOtherTasks(selection)
        ])

        return [...s.values()];
    }

    return lib;
})();