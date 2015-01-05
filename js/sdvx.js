function Track(track) {
    var self = this;
    self.id = track["id"];
    self.title = track["title"];

    self.img = ko.computed(function() {
        return "jacket/" + self.id + ".jpg";
    });

    self.clearmark_id = ko.observable(0);
    self.clearmark = ko.computed(function() {
        var mark = self.clearmark_id();
        if (mark == 1)
        {
            // Complete
            return "GreenYellow";
        }
        else if (mark == 2)
        {
            // Hard clear
            return "DarkViolet";
        }
        else if (mark == 3)
        {
            // Ultimate chain
            return "Red";
        }
        else if (mark == 4)
        {
            // Perfect
            return "Gold";
        }

        return "rgba(0,0,0,0)";
    });
    self.changeClearmark = function() {
        var mark = self.clearmark_id() + 1;
        mark %= 5;
        self.clearmark_id(mark);
    }

    self.clearrank_id = ko.observable(0);
    self.clearrank = ko.computed(function() {
        var rank = self.clearrank_id();
        if (rank == 1)
        {
            return "B";
        }
        else if (rank == 2)
        {
            return "A";
        }
        else if (rank == 3)
        {
            return "AA";
        }
        else if (rank == 4)
        {
            return "AAA";
        }
        return "　";
    });
    self.changeClearrank = function() {
        var rank = self.clearrank_id() + 1;
        rank %= 5;
        self.clearrank_id(rank);
    }
}

function ClearListModel(tracks) {
    var self = this;
    self.tracks = tracks;

    self.initialize = function() {
        $.getJSON("data/tracks.json", function(data) {
            for (var i = 0; i < data["tracks"].length; i++) {
                var track = data["tracks"][i];
                var level = track["level"];
                var difficulty = track["difficulty"];
                if (level == 15)
                {
                    if (difficulty == "exh")
                    {
                        self.tracks[0].push(new Track(track));
                    }
                    else if (difficulty == "inf" || difficulty == "grv")
                    {
                        self.tracks[1].push(new Track(track));
                    }
                }
                else if (level == 16)
                {
                    self.tracks[2].push(new Track(track));
                }
            };
            self.loadStorageData();
        });
    }

    self.loadStorageData = function() {
        storeData = localStorage.getItem("ClearList");
        if (storeData == null || storeData == undefined) {
            return;
        }
        storeData = JSON.parse(storeData);

        for (var i = 0; i < self.tracks.length; i++) {
            for (var j = 0; j < self.tracks[i]().length; j++) {
                var track = self.tracks[i]()[j];

                for (var k = 0; k < storeData.length; k++) {
                    if (track.id == storeData[k].id) {
                        if (0 <= storeData[k].rank && storeData[k].rank <= 4) {
                            track.clearrank_id(storeData[k].rank);
                        }
                        if (0 <= storeData[k].mark && storeData[k].mark <= 4) {
                            track.clearmark_id(storeData[k].mark);
                        }
                    }
                };
            };
        };
    }

    self.saveStorageData = function() {
        storeData = [];
        for (var i = 0; i < self.tracks.length; i++) {
            for (var j = 0; j < self.tracks[i]().length; j++) {
                var track = self.tracks[i]()[j];
                var trackData = {
                    "id": track.id,
                    "rank": track.clearrank_id(),
                    "mark": track.clearmark_id()
                };
                storeData.push(trackData);
            };
        };
        localStorage.setItem("ClearList", JSON.stringify(storeData));
    }
}

function ClearListViewModel() {
    var self = this;

    self.tracks15exh = ko.observableArray();
    self.tracks15inf = ko.observableArray();
    self.tracks16 = ko.observableArray();
    var tracks = [self.tracks15exh, self.tracks15inf, self.tracks16];
    self.model = new ClearListModel(tracks);
    self.model.initialize();

    self.downloadUrl = ko.observable("");

    self.saveImage = function() {
        html2canvas($("#clearlist"), {
            onrendered: function(canvas) {
                self.downloadUrl(canvas.toDataURL("image/jpeg"));
            }
        });
        self.model.saveStorageData();
    }
}

$(document).ready(function() {
    ko.applyBindings(new ClearListViewModel());
});


// chrome --allow-file-access-from-files