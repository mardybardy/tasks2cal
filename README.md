# Tasks To Cal

## Install

git clone this repository

`git clone https://github.com/feraleyebrows/tasks2cal Tasks2Cal.omnifocusjs`

Alternatively, download as a zip file, unarchive, and then rename the folder: 

`Tasks2Cal.omnifocusjs`

Once you have the file on your machine double click (or right click, open with... and select Omnifocus) and Omnifocus should automatically install it. 

If the plugin is not installed via the above method, you may have to drag it manually into the plug-ins folder.

If it has installed correctly, if you load Omnifocus and click 'Automation' in the menu bar you should now see 'Tasks2Cal' as one of the options in the drop down menu.

## Usage

Select some tasks you want to add to you calendar. Then click 'Automation -> Tasks2Cal' in the menu bar. This should bring up a pop up window with the following options:

- Calendar App
- Start Date
- End Date
- Default duration
- Ignore unestimated fields
- If Total Task Duration Exceeds Time

### Calendar App

Currently you can choose between BusyCal and Fantastical as they support adding calendar events via app URL schemes. Apple Calendar does not offer this functionality directly as far as I'm aware.

### Start and End Date

Your settings will be saved every time you run the plugin. Dates will always default to tomorrow but the time window will stay the same. For example, if you loaded the plugin for the first time on the 1st January 2023, the default selected dates would be as follows:

**Start Date: 2nd January 2023 09:00**

**End Date: 2nd January 2023 17:00**

You may then adjust those times to match your desired time window. For example:

**Start Date: 2nd January 2023 10:00**

**End Date: 2nd January 2023 16:00**

If you then loaded the plugin again the next day on the 2nd January 2023, the default selections will be:

**Start Date: 3rd January 2023 10:00**

**End Date: 3rd January 2023 16:00**

### Default Duration

This is how long a calendar event will last for if you have not specified a time estimate on it within Omnifocus. The value should be an integer number that represents the minutes you want to spend on the task.

### Ignore Unestimated Fields

Will ignore any selected tasks that do not have time estimates on them. Useful if you have nested tasks as you can set a time estimate on either the parent or the child tasks and the unestimated parent or child will not also be added as an event.

### If Total Task Duration Exceeds Time.

This option allows you to specify what the plug in should do if you have selected tasks that have exceeded the allocated time window. For example, suppose you have selected the following dates:

**Start Date: 1st January 2023 09:00**

**End Date: 1st January 2023 10:00**

**Default Duration: 30 mins**

You therefore have a 1 hour window (60 minutes) of total time available for your selected tasks.

Now suppose you have selected the following tasks:

- Work out. Estimate: 60 mins.
- Shower. No Estimate.
- Eat breakfast. Estimate: 10 mins.

This is how they will play out depending on the option you choose:

#### Stop Adding Tasks When End Date Reached
```
- 09:00 to 10:00 Work Out
```

No other events will be added as all available time has been used.

#### Squash Task Durations To Fit Window
```
- 09:00 to 09:25 Work Out
- 09:25 to 09:50 Shower
- 09:50 to 10:00 Eat breakfast
```

The average time available for all all tasks is 20 minutes (60 minutes / 3 tasks).

Any tasks longer than the average will be truncated. Any tasks shorter will be unaffected.

Short tasks are subtracted from the total time.

60 minutes total - 10 minutes (eat breakfast) = 50 minutes remaining.

In this case only 'Eat Breakfast. 10 minutes' is a shorter than the average task time (20 minutes) as "Shower" has no estimate in omnifocus so it falls back to the default task duration which has been set to 30 minutes.

The remaining time is then divided by the average amount of tasks remaining:

50 minutes / 2 tasks = 25 minutes

And this is the time assigned to all tasks longer than the average (Work out, shower).

#### Continue adding tasks past end date
```
- 09:00 to 10:00 Work Out
- 10:00 to 10:30 Shower
- 10:30 to 10:45 Eat breakfast
```

This is pretty self explanatory. The end date is ignored entirely and tasks are added regardless.



