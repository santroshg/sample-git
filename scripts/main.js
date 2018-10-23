var GH = GH || {};

(function ($, ns) {
    if ($ === undefined) {
        console.log("jQuery not found");
        return false;
    }

    ns.init = function() {
      GRepo.init();
    };

    var uiSelectors = {
        form: $("#github-user-form"),
        dataContainer:  $("#repositories"),
        usernameInput:  $('#github-user'),
        loader: $("#loader"),
        issueFormContainer:  $( "#issue-form-container" ),
        createIssueSelectorClass: 'create-issue',
        msgClass: 'msg'
    };
    var OAUTH_TOKEN = 'a98e9fe80726d80198479c6771152010b92d3454',
        Client_ID = '75b7af763bf555da49f6',
        Client_Secret = '9247cd138e7349e349baa5b9aa5727f2f4c4447d',
        repouri = 'https://api.github.com/users/{username}/repos?client_id='+Client_ID+'&client_secret='+Client_Secret,
        createIssueUri = 'https://api.github.com/repos/{owner}/{repo}/issues',
        provider = 'github';

    var GRepo = {
        init: function() {
            this.bindEvents();
            OAuth.initialize(APP_KEY);
            this.provider = provider;
          //  this.oAuthHandler = oAuthHandler.init(provider, OAUTH_TOKEN);
        },

        bindEvents: function() {
            var _this = this;
            $(uiSelectors.form).submit(function(e) {
                e.preventDefault();
                _this.getRepositories(uiSelectors.usernameInput.val());
            });

            this.issueFormHandler();
        },

        getRepositories: function(username) {
            this.getGHRepoData(this.getRequestUri(username), this.renderRepoData.bind(this));
        },

        getGHRepoData: function (url, callback) {
            var _this = this;
            uiSelectors.loader.show();
            uiSelectors.dataContainer.html("");
            $.getJSON(url, function(json){
                callback.call(null, json);
                uiSelectors.loader.hide();
            }).fail(function() {
                _this.onFailure();
                uiSelectors.loader.hide();
            });
        },

        onFailure: function() {
            uiSelectors.dataContainer.html("No repository found!");
        },

        renderRepoData: function(repositories) {
            if(repositories.length == 0) {
                this.onFailure();
                return;
            }

            var html = ' <ul class="list-group">';
            $.each(repositories, function(index) {
                html +=  '<li class="list-group-item"><h4 class"mb-1"><a href="'+repositories[index].html_url+'" target="_blank">'+repositories[index].name + '</a>  <button class="btn btn-warning pull-right create-issue" data-name='+repositories[index].name+'>Create Issue</button> </h4></li>';
            });
            html += '</ul>';
            uiSelectors.dataContainer.html(html);
            this.addEventToCreateIssue();
            //console.log(repositories);
        },

        addEventToCreateIssue: function() {
            var _this = this;
            $("."+uiSelectors.createIssueSelectorClass).on("click", function(e) {
                e.preventDefault();
               _this.createIssueHandler($(this));

            });
        },

        issueFormHandler: function(ele) {
            var _this = this;
            _this.dialog = uiSelectors.issueFormContainer.dialog({
                autoOpen: false,
                height: 370,
                width: 750,
                modal: true,
                buttons: {
                  "Create Issue": function() {
                    _this.createIssue(_this.dialog.form.selectedEle);
                  },
                  Cancel: function() {
                    _this.dialog.dialog( "close" );
                  }
                },
                close: function() {
                    _this.dialog.form [ 0 ].reset();
                    uiSelectors.issueFormContainer.find("."+uiSelectors.msgClass).html("");
                }
            });

            _this.dialog.form = uiSelectors.issueFormContainer.find( "form" ).on( "submit", function( event ) {
                event.preventDefault();
                _this.createIssue(_this.dialog.form.selectedEle);
            });
        },

        createIssue: function(ele) {
            var url = createIssueUri.replace('{owner}', uiSelectors.usernameInput.val()).replace('{repo}', ele.data('name'));
            var formData = JSON.stringify({title: this.dialog.form.get(0).title.value, body: this.dialog.form.get(0).body.value});
            var _this = this;
            $.ajax({
               type: "POST",
               headers: {"Authorization": "token " + OAUTH_TOKEN},
                url: url,
                data: formData,
                success: function() {
                    _this.afterCreatIssueSuccess();
                },
              });
        },

        afterCreatIssueSuccess: function() {
            var _this = this;
            uiSelectors.issueFormContainer.find("."+uiSelectors.msgClass).html("Issue created Successfully!");
            setTimeout(function() {
                _this.dialog.dialog("close");
            }, 2000);
        },

        createIssueHandler: function(ele) {
            this.showIssueForm(ele);
        },

        showIssueForm: function(ele) {
            uiSelectors.issueFormContainer.find("[data-type=repo-title]").html(ele.data('name'));
            this.dialog.dialog( "open" );
            this.dialog.form.selectedEle = ele;
        },

        getRequestUri: function(username) {
            return repouri.replace('{username}', username);
        }
    };
  ns.init();

})(window.jQuery, GH);
