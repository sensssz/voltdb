﻿
var ispopupRevoked = false;
var table = '';

$(document).ready(function () {

    localStorage.clear(); //clear the localStorage for DataTables in DR Section

    var rv = -1;
    if ($.cookie("username") != undefined && $.cookie("username") != 'null') {
        $("#logOut").css('display', 'block');
    } else {
        $("#logOut").css('display', 'none');
    }

    //search text clean up required for mozilla
    $("#filterDatabaseTable").val('');
    $("#filterStoredProc").val('');

    //Prevent scrolling of page.
    $('#navSchema').on("click", function (e) {
        //Browser validation for IE version less than IE 11
        if (navigator.userAgent.indexOf('MSIE') >= 0) {
            window.location.hash = "#o"; //This is required for IE.
            setTimeout(function () {
                window.scrollTo(0, 0);
            }, 10);
        }

            //IE 11 is just a preview release.
            //Hence validation expressions may differs after the full version is released
            //In such case, below validation has to be updated
        else if (navigator.appName == 'Netscape') {
            var ua = navigator.userAgent;
            var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");

            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
                if (rv == 11) {
                    window.location.hash = "#o"; //This is required for IE.
                    setTimeout(function () {
                        window.scrollTo(0, 0);
                    }, 10);
                }
            }
        }
        e.preventDefault();
    });

    try {
        var savedData = getParameterByName("data");

        if (savedData != undefined && savedData != "") {
            var json = jQuery.parseJSON(decodeURIComponent(savedData));

            if (json["DisplayPreferences"] != undefined && json["DisplayPreferences"] != "")
                saveCookie("user-preferences", json["DisplayPreferences"]);

            if (json["GraphView"] != undefined && json["GraphView"] != "")
                saveCookie("graph-view", json["GraphView"]);

            if (json["CurrentServer"] != undefined && json["CurrentServer"] != "")
                saveCurrentServer(json["CurrentServer"]);

            if (json["username"] != undefined && json["username"] != "")
                saveSessionCookie("username", json["username"]);

            if (json["password"] != undefined && json["password"] != "")
                saveSessionCookie("password", json["password"]);

            if (json["AlertThreshold"] != undefined && json["AlertThreshold"] != "")
                saveCookie("alert-threshold", json["AlertThreshold"]);

            if (json["tab"] == "admin") {
                saveSessionCookie("current-tab", NavigationTabs.Admin);
            }

            location.href = location.href.split("?")[0];
        }
    } catch (e) {/*Ignore error.*/ }

    // Toogle Server popup
    $('#btnPopServerList').click(function (event) {

        $("#popServerSearch").val('');
        $("#popServerSearch").attr('placeholder', 'Search Server');
        $('#popServerSearch').keyup();
        event.stopPropagation();
        if ($('#popServerList').css('display') == 'none') {
            $(this).removeClass('showServers');
            $(this).addClass('hideServers');
        } else {
            $(this).removeClass('hideServers');
            $(this).addClass('showServers');

        };
        $('#popServerList').toggle('slide', '', 1500);


        $("#wrapper").click(function () {
            if ($('#popServerList').css('display') == 'block') {
                $('#popServerList').hide();
                $('#btnPopServerList').removeClass('hideServers');
                $('#btnPopServerList').addClass('showServers');
            }

        });
    });

    $("#popServerList").on("click", function (event) {
        event.stopPropagation();
    });

    // Pop Slide Server Search
    $('#popServerSearch').keyup(function () {
        var searchText = $(this).val().toLowerCase();
        $('ul.servers-list > li').each(function () {
            var currentLiText = $(this).text().toLowerCase(),
                showCurrentLi = currentLiText.indexOf(searchText) !== -1;
            $(this).toggle(showCurrentLi);
        });
    });

    // Implements Scroll in Server List div
    $('#serverListWrapper').slimscroll({
        disableFadeOut: true,
        height: '225px'
    });

    // Tabs Default Action
    $(".tab_content").hide(); //Hide all content
    $("ul.tabs li:first").addClass("active").show(); //Activate first tab
    $(".tab_content:first").show(); //Show first tab content

    // Show Hide Graph Block
    $('#showHideGraphBlock').click(function () {
        var userPreferences = getUserPreferences();
        if (userPreferences != null) {
            if (userPreferences['ClusterLatency'] != false || userPreferences['ClusterTransactions'] != false || userPreferences['ServerCPU'] != false || userPreferences['ServerRAM'] != false || userPreferences["PartitionIdleTime"] != false || userPreferences["DrReplicationRate"] != false) {
                var graphState = $("#mainGraphBlock").css('display');
                if (graphState == 'none') {
                    $(".showhideIcon").removeClass('collapsed');
                    $(".showhideIcon").addClass('expanded');
                } else {
                    $(".showhideIcon").removeClass('expanded');
                    $(".showhideIcon").addClass('collapsed');
                }
                $('#mainGraphBlock').slideToggle();

                MonitorGraphUI.UpdateCharts();
            }
        }
    });

    //DR Show/hide toggle
    // Show Hide Graph Block
    $('#showHideDrBlock').click(function () {
        $(".drShowHide").toggle();
        var $this = $(this);
        var drState = $(".drShowHide").css('display');
        if (drState == 'none') {
            $this.removeClass('expanded');
            $this.addClass('collapsed');

        } else {
            $this.removeClass('collapsed');
            $this.addClass('expanded');

        }


    });

    // Shows memory alerts
    $('#showMemoryAlerts').popup();
    $('.drWarning').popup();

    //Logout popup
    $('#logOut').popup();
    $('#btnlogOut').popup();

    //Shows Save Snapshot status
    $('#btnSaveSnapshotPopup').popup({
        open: function (event, ui, ele) {
            if ($('#saveSnapshotStatus').html().indexOf("Snapshot queued successfully") > -1) {
                $("#imgSaveSnapshotStatus").hide();
            } else {
                $("#imgSaveSnapshotStatus").show();
            }
        }
    });

    // Filters Stored Procedures
    $('#filterStoredProc').keyup(function () {
        var that = this;
        $.each($('.storeTbl tbody tr'),
        function (i, val) {
            if ($(val).text().indexOf($(that).val().toLowerCase()) == -1) {
                $('.storeTbl tbody tr').eq(i).hide();
            } else {
                $('.storeTbl tbody tr').eq(i).show();
            }
        });
    });

    // Filters Database Tables
    $('#filterDatabaseTable').keyup(function () {
        var that = this;
        $.each($('.dbTbl tbody tr'),
        function (i, val) {
            if ($(val).text().indexOf($(that).val().toLowerCase()) == -1) {
                $('.dbTbl tbody tr').eq(i).hide();
            } else {
                $('.dbTbl tbody tr').eq(i).show();
            }
        });
    });

    var refreshCss = function () {
        //Enable Schema specific css only for Schema Tab.
        if (VoltDbUI.CurrentTab == NavigationTabs.Schema) {
            $('#styleBootstrapMin').removeAttr('disabled');
            $('#styleBootstrapResponsive').removeAttr('disabled');
            $('#styleThemeBootstrap').removeAttr('disabled');
            $("#nav").css("left", navLeft - 100);

            $('#styleBootstrapMin').removeProp("disabled");
            $('#styleBootstrapResponsive').removeProp("disabled");
            $('#styleThemeBootstrap').removeProp("disabled");
        } else {
            $("#styleBootstrapMin").attr('disabled', 'disabled');
            $("#styleBootstrapResponsive").attr('disabled', 'disabled');
            $("#styleThemeBootstrap").attr('disabled', 'disabled');
            $("#nav").css("left", navLeft);

            //This is required for firefox
            $('#styleBootstrapMin').prop("disabled", true);
            $('#styleBootstrapResponsive').prop("disabled", true);
            $('#styleThemeBootstrap').prop("disabled", true);
        }
    };



    refreshCss();
    var navLeft = $("#nav").css("left");
    $("#nav li").click(function () {
        $('.contents').hide().eq($(this).index()).show();
        $("#nav li").removeClass('active');
        $(this).addClass('active');
        VoltDbUI.CurrentTab = getCurrentTab();
        refreshCss();
        saveSessionCookie("current-tab", VoltDbUI.CurrentTab);

        //Activate Shortcut keys only if the current tab is "SQL Query".
        //Also show proper help contents as per the choosen tab.
        if (VoltDbUI.CurrentTab == NavigationTabs.SQLQuery) {

            $("#VDBMonHelp").hide();
            $("#VDBSchHelp").hide();
            $("#VDBQHelp").show();
            $("#VDBAdmHelp").hide();

            if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
                shortcut.add("f6", function () {
                    $("#runBTn").button().click();
                });
            } else {
                shortcut.add("f5", function () {
                    $("#runBTn").button().click();
                });
            }
        } else {

            //Refresh the charts if the current tab is "DB Monitor"
            if (VoltDbUI.CurrentTab == NavigationTabs.DBMonitor) {

                $("#VDBMonHelp").show();
                $("#VDBSchHelp").hide();
                $("#VDBQHelp").hide();
                $("#VDBAdmHelp").hide();

                MonitorGraphUI.UpdateCharts();
            }
            else if (VoltDbUI.CurrentTab == NavigationTabs.Schema) {

                $("#VDBMonHelp").hide();
                $("#VDBSchHelp").show();
                $("#VDBQHelp").hide();
                $("#VDBAdmHelp").hide();
            }
            else if (VoltDbUI.CurrentTab == NavigationTabs.Admin) {

                $("#VDBMonHelp").hide();
                $("#VDBSchHelp").hide();
                $("#VDBQHelp").hide();
                $("#VDBAdmHelp").show();
            }

            shortcut.remove("f5");
            shortcut.remove("f6");
        }
    });

    //Attach the login popup to the page.
    $("body").append(voltDbRenderer.GetLoginPopup());

    var serverName = VoltDBConfig.GetDefaultServerIP();
    var portid = VoltDBConfig.GetPortId();

    //If security is enabled, then it displays login popup. After user is verified, it calls loadPage().
    //If security is not enabled, then it simply calls loadPage().
    voltDbRenderer.HandleLogin(serverName, portid, function () {
        loadPage(serverName, portid);
    });

    window.onscroll = function () {
        if (VoltDbUI.isSchemaTabLoading && VoltDbUI.CurrentTab == NavigationTabs.Schema)
            window.scrollTo(0, 0);
    };
});

function logout() {
    saveSessionCookie("username", null);
    saveSessionCookie("password", null);
    saveSessionCookie("current-tab", NavigationTabs.DBMonitor);
    $('#logOut').prop('title', '');
    location.reload(true);
};

function changePassword(obj) {
    var id = obj.id;
    $(obj).css('display', 'none');
    $(obj.parentElement).children('input').each(function () {
        $(this).css('display', 'inline-block'); // "this" is the current element in the loop
    });
}

var loadPage = function (serverName, portid) {
    $(".drShowHide").show();
    $("#showHideDrBlock").removeClass('collapsed');
    $("#showHideDrBlock").addClass('expanded');
    var userName = $.cookie('username') != undefined ? $.cookie('username') : "";
    var password = $.cookie('password') != undefined ? $.cookie('password') : "";

    voltDbRenderer.ChangeServerConfiguration(serverName, portid, userName, password, true, true);
    voltDbRenderer.ShowUsername(userName);

    loadSQLQueryPage(serverName, portid, userName);
    VoltDbUI.refreshSqlAndSchemaTab();

    VoltDbUI.partitionGraphInterval = setInterval(function () {
        if (getCurrentServer() != undefined) {
            window.clearInterval(VoltDbUI.partitionGraphInterval);
            voltDbRenderer.GetPartitionIdleTimeInformation(function (partitionDetail) {
                MonitorGraphUI.GetPartitionDetailData(partitionDetail);
            });
        }
    }, 5000);


    var showAdminPage = function () {
        if (!VoltDbAdminConfig.isAdmin) {
            VoltDbAdminConfig.isAdmin = true;

            if ($.cookie("sql_port_for_paused_db") == sqlPortForPausedDB.UseAdminPort) {
                VoltDBService.SetConnectionForSQLExecution(true);
                SQLQueryRender.saveConnectionKey(true);
            }

            $("#navAdmin").show();
            loadAdminPage();
        }

    };

    //Retains the current tab while page refreshing.
    var retainCurrentTab = function () {

        if (!(securityChecks.securityChecked && securityChecks.previlegesChecked))
            return;

        var curTab = $.cookie("current-tab");
        if (curTab != undefined) {
            curTab = curTab * 1;
            if (curTab == NavigationTabs.Schema) {
                $("#overlay").show();
                setTimeout(function () { $("#navSchema > a").trigger("click"); }, 100);
            } else if (curTab == NavigationTabs.SQLQuery) {
                $("#overlay").show();
                setTimeout(function () { $("#navSqlQuery > a").trigger("click"); }, 100);
            } else if (curTab == NavigationTabs.Admin) {
                if (VoltDbAdminConfig.isAdmin) {
                    $("#overlay").show();
                    setTimeout(function () { $("#navAdmin > a").trigger("click"); }, 100);
                } else {
                    saveSessionCookie("current-tab", NavigationTabs.DBMonitor);
                }
            }
        }
    };

    var securityChecks = {
        securityChecked: false,
        previlegesChecked: false
    };

    //Load Admin configurations
    voltDbRenderer.GetAdminDeploymentInformation(true, function (adminConfigValues, rawConfigValues) {
        securityChecks.securityChecked = true;

        //Show admin page if security is turned off.
        if (adminConfigValues != null && adminConfigValues.VMCNoPermission != true && !adminConfigValues.security) {
            showAdminPage();
        } else if (!VoltDbAdminConfig.isAdmin) {
            $("#navAdmin").hide();
        }

        retainCurrentTab();
    });


    voltDbRenderer.CheckAdminPriviledges(function (hasAdminPrivileges) {
        securityChecks.previlegesChecked = true;

        if (hasAdminPrivileges) {
            showAdminPage();
        } else if (!VoltDbAdminConfig.isAdmin) {
            $("#navAdmin").hide();
        }

        retainCurrentTab();
    });

    $("#loginWarnPopup").popup({
        afterOpen: function (event, ui, ele) {
            var popup = $(this)[0];

            $("#btnLoginWarningOk").unbind("click");
            $("#btnLoginWarningOk").on('click', function () {

                if (!VoltDbUI.hasPermissionToView) {
                    location.reload(true);
                } else {
                    if (VoltDbUI.CurrentTab == NavigationTabs.Admin) {
                        setTimeout(function () {
                            $("#navDbmonitor").trigger("click");
                        }, 500);
                    }

                    $("#navAdmin").hide();
                }
                popup.close();
            });
        },
        closeContent: '',
        modal: true
    });

    var defaultSearchTextProcedure = 'Search Stored Procedures';
    var defaultSearchTextTable = 'Search Database Tables';

    var currentProcedureAction = VoltDbUI.ACTION_STATES.NONE;
    var priorProcedureAction = VoltDbUI.ACTION_STATES.NONE;
    var currentTableAction = VoltDbUI.ACTION_STATES.NONE;
    var priorTableAction = VoltDbUI.ACTION_STATES.NONE;
    VoltDbUI.CurrentTab = getCurrentTab();

    RefreshServerUI();

    var version = "";
    var setVersionCheckUrl = function (currentServer) {
        if (version == "") {
            version = voltDbRenderer.getVersion(currentServer);
            $('#versioncheck').attr('src', 'http://community.voltdb.com/versioncheck?app=vmc&ver=' + version);
        }
    };

    var refreshClusterHealth = function () {
        //loads cluster health and other details on the top banner
        var loadClusterHealth = function () {
            voltDbRenderer.GetClusterHealth(function (htmlData, alertHtmlData) {
                $("#clusterHealth").html(htmlData).show();
                $("#memoryAlertsList").html(alertHtmlData);
            });

            voltDbRenderer.mapNodeInformationByStatus(function (htmlData) {

                var currentServer = getCurrentServer();
                if (currentServer == undefined) {
                    saveCurrentServer(htmlData.ServerInformation[1].CurrentServer);
                }

                $(".activeServerName").html(htmlData.ServerInformation[1].CurrentServer).attr('title', htmlData.ServerInformation[1].CurrentServer);
                $("#serversList").html(htmlData.ServerInformation[0].ServersList);
                setVersionCheckUrl(htmlData.ServerInformation[1].CurrentServer);

                //Trigger search on the newly loaded list. This is required to
                //search server since we are refreshing the server list.
                if ($("#popServerSearch").val() != "Search Server")
                    $("#popServerSearch").trigger("keyup");
            });

            //hide loading icon
            $("#overlay").hide();

            $('#serversList > li.active > a').click(function () {
                var clickedServer = $(this).html();
                $('.activeServerName').html(clickedServer).attr('title', clickedServer);

                if ($('#popServerList').css('display') == 'none') {
                    $('#btnPopServerList').removeClass('showServers');
                    $('#btnPopServerList').addClass('hideServers');
                } else {
                    $('#btnPopServerList').removeClass('hideServers');
                    $('#btnPopServerList').addClass('showServers');

                };
                $('#popServerList').toggle('slide', '', 1500);
                $(this).parent().prevAll().removeClass('monitoring');
                $(this).parent().nextAll().removeClass('monitoring');
                $(this).parent().addClass('monitoring');


                var serverIp = voltDbRenderer.getServerIP($(this).attr('data-ip'));
                var currentUrl = window.location.href.split('?')[0];
                var urlArray = currentUrl.split('/');
                var newUrl = '';
                if (urlArray != null && urlArray.length > 0) {
                    var urlArray2 = urlArray[2].split(':');
                    urlArray2[0] = serverIp;
                    urlArray[2] = urlArray2.join(':');
                    newUrl = urlArray.join('/');
                }
                var data = {
                    CurrentServer: clickedServer,
                    GraphView: $.cookie("graph-view"),
                    DisplayPreferences: $.cookie("user-preferences"),
                    AlertThreshold: $.cookie("alert-threshold"),
                    username: $.cookie("username"),
                    password: $.cookie("password"),
                };

                var win = window.open(newUrl + '?data=' + encodeURIComponent(JSON.stringify(data)), '_parent');
                win.focus();

            });

            var lUserPreferences = getUserPreferences();
            showHideGraph(lUserPreferences);
        };
        var loadAdminTabPortAndOverviewDetails = function (portAndOverviewValues, serverSettings) {
            VoltDbAdminConfig.displayPortAndRefreshClusterState(portAndOverviewValues, serverSettings);
        };

        var loadAdminServerList = function (serverList) {
            VoltDbAdminConfig.refreshServerList(serverList);
            $(VoltDbAdminConfig.runningServerIds).on('click', function () {
                openPopup($(this));
            });

            $('.tblshutdown  >tbody > tr.activeHost > td:first-child > a').click(function () {
                var clickedServer = $(this).html();
                var serverIp = voltDbRenderer.getServerIP($(this).parent().siblings('td:first').find("a").attr('data-hostid'));
                var currentUrl = window.location.href.split('?')[0];
                var urlArray = currentUrl.split('/');
                var newUrl = '';
                if (urlArray != null && urlArray.length > 0) {
                    var urlArray2 = urlArray[2].split(':');
                    urlArray2[0] = serverIp;
                    urlArray[2] = urlArray2.join(':');
                    newUrl = urlArray.join('/');
                }

                var data = {
                    CurrentServer: clickedServer,
                    GraphView: $.cookie("graph-view"),
                    DisplayPreferences: $.cookie("user-preferences"),
                    AlertThreshold: $.cookie("alert-threshold"),
                    username: $.cookie("username"),
                    password: $.cookie("password"),
                    tab: 'admin'
                };

                var win = window.open(newUrl + '?data=' + encodeURIComponent(JSON.stringify(data)), '_parent');
                win.focus();
            });
        };

        var openPopup = function (srcElement) {
            var i = 0;
            var hostName = srcElement.attr('data-HostName');
            var hostId = srcElement.attr('data-HostId');
            var idleServerDetails;

            var popup = new $.Popup({
                content: "#stopConfirmationPop",

                afterOpen: function () {
                    $("#StopConfirmOK").unbind("click");
                    $("#StopConfirmOK").on("click", function () {

                        //API Request
                        try {
                            voltDbRenderer.stopServer(hostId, hostName, function (success, statusString) {
                                if (success) {
                                    adminClusterObjects.ignoreServerListUpdateCount = 2;
                                    updateServers(hostId, hostName, "MISSING");
                                    $("#stopServer_" + hostName).addClass('disableServer');
                                    $("#stopServer_" + hostName + " span").addClass('shutdownServer');
                                    $("#stopServer_" + hostName + " span").addClass('stopDisable');


                                }
                                else {
                                    $('#errorLabel').text(statusString);
                                    popup.open("#divStopServerError", undefined, srcElement);

                                }

                            });

                        }
                        catch (error) {

                        }

                        //Close the popup
                        $($(this).siblings()[0]).trigger("click");

                    });

                    $("#StopConfirmCancel").unbind("click");
                    $("#StopConfirmCancel").on("click", function () {
                        popup.close();
                    });
                }

            });
            popup.open("#stopConfirmationPop", undefined, srcElement);
            //$('#errorLabel').text("Cannot stop the requested node. Stopping individual nodes is only allowed on a K-safe cluster. Use shutdown to stop the cluster.");
            //popup.open("#divStopServerError", undefined, srcElement);
        };


        voltDbRenderer.GetSystemInformation(loadClusterHealth, loadAdminTabPortAndOverviewDetails, loadAdminServerList);


        //Load Admin configurations
        voltDbRenderer.GetAdminDeploymentInformation(false, function (adminConfigValues, rawConfigValues) {

            if (!VoltDbUI.hasPermissionToView)
                return;

            if (rawConfigValues.status == -3 && VoltDbAdminConfig.isAdmin) {
                VoltDbAdminConfig.isAdmin = false;
                setTimeout(function () {
                    var checkPermission = function () {

                        if (!VoltDbUI.hasPermissionToView)
                            return;
                        else
                            $("#loginWarningPopupMsg").text("Security settings have been changed. You no longer have permission to view Admin Tab.");

                        if (!$("#loginWarningPopup").is(":visible")) {
                            $("#loginWarnPopup").trigger("click");
                        }

                    };
                    voltDbRenderer.GetSystemInformation(checkPermission, function (portAndOverviewValues, serverSettings) { }, function (data) { });
                }, 2000);
            } else
                VoltDbAdminConfig.displayAdminConfiguration(adminConfigValues, rawConfigValues);
        });
    };

    var refreshGraphAndData = function (graphView, currentTab) {
        voltDbRenderer.getMemoryGraphInformation(function (memoryDetails) {
            MonitorGraphUI.RefreshMemory(memoryDetails, getCurrentServer(), graphView, currentTab);
        });

        voltDbRenderer.getLatencyGraphInformation(function (latencyDetails) {
            MonitorGraphUI.RefreshLatency(latencyDetails, graphView, currentTab);
        });

        voltDbRenderer.GetTransactionInformation(function (transactionDetails) {
            MonitorGraphUI.RefreshTransaction(transactionDetails, graphView, currentTab);
        });

        voltDbRenderer.getCpuGraphInformation(function (cpuDetails) {
            MonitorGraphUI.RefreshCpu(cpuDetails, getCurrentServer(), graphView, currentTab);
        });

        voltDbRenderer.GetPartitionIdleTimeInformation(function (partitionDetail) {
            if (getCurrentServer() != undefined)
                MonitorGraphUI.RefreshPartitionIdleTime(partitionDetail, getCurrentServer(), graphView, currentTab);
        });

        voltDbRenderer.GetClusterReplicaInformation(function (replicaDetail) {
            if (getCurrentServer() != undefined) {
                var currentServer = getCurrentServer();
                if (replicaDetail.hasOwnProperty(currentServer))
                    VoltDbUI.drReplicationRole = replicaDetail[currentServer]['status'];
                else
                    return;
                voltDbRenderer.GetDrStatusInformation(function (drDetails) {
                    if (getCurrentServer() != undefined) {
                        var drResult = drDetails["Details"]["STATUS"];
                        if (drResult != -2) {
                            VoltDbUI.drMasterEnabled = (drDetails[currentServer]['MASTERENABLED'] != null && drDetails[currentServer]['MASTERENABLED'] != false) ? true : false;
                            //show master/replica table
                            if (!(VoltDbUI.drReplicationRole.toLowerCase() == "none" && !VoltDbUI.drMasterEnabled)) {
                                var userPreference = getUserPreferences();
                                VoltDbUI.isDRInfoRequired = true;
                                VoltDbUI.drStatus = drDetails[currentServer]['SYNCSNAPSHOTSTATE'];
                                VoltDbUI.isFirstHit = false;
                                //show replicaDetail table
                                if (userPreference["DRTables"]) {
                                    $("#divDrReplication").show();
                                }

                                $('#liDrTables').css('display', 'block');
                                showHideLastLineClass(true);

                                $("#divDrWrapperAdmin").show();

                                if (VoltDbUI.drMasterEnabled) {
                                    $("#drMasterSection").show();
                                    //$(".replicaWrapper").css('top', '0');
                                    //show master table
                                    refreshDrMasterSection();
                                } else {
                                    //$(".replicaWrapper").css('top', '0');
                                    $("#drMasterSection").hide();
                                }

                                if (VoltDbUI.drReplicationRole.toLowerCase() == 'replica') {
                                    $('#liDrReplication').css('display', 'block');
                                    if (userPreference["DrReplicationRate"]) {
                                        $("#ChartDrReplicationRate").show();
                                    }
                                    refreshDrReplicaSection(graphView, currentTab);
                                    $("#drSection").removeClass("drHeightBoth");
                                    $("#drSection").removeClass("drHeightIndividual");
                                    //to show DR Mode and DR tables
                                    if (VoltDbUI.drMasterEnabled) {
                                        $("#drSection").addClass("drHeightBoth");
                                        $("#dbDrMode").text("Both");
                                        $('#drMasterSection').css('display', 'block');
                                        $(".replicaWrapper").css('top', '-27px');
                                    } else {
                                        $("#dbDrMode").text("Replica");
                                        $(".replicaWrapper").css('top', '0px');
                                        $("#drSection").addClass("drHeightIndividual");
                                        $('#drMasterSection').css('display', 'none');
                                    }
                                    $('#drReplicaSection').css('display', 'block');
                                } else {
                                    $('#liDrReplication').css('display', 'none');
                                    $("#ChartDrReplicationRate").hide();
                                    //to show DR Mode
                                    if (VoltDbUI.drMasterEnabled) {
                                        $("#dbDrMode").text("Master");
                                        $('#drMasterSection').css('display', 'block');
                                    } else {
                                        $("#dbDrMode").text("None");
                                        $('#drMasterSection').css('display', 'none');
                                    }
                                    $('#drReplicaSection').css('display', 'none');
                                }
                            } else {
                                VoltDbUI.isDRInfoRequired = false;
                                $("#divDrReplication").hide();
                                $('#liDrReplication').css('display', 'none');
                                $('#liDrTables').css('display', 'none');
                                showHideLastLineClass(false);
                                $("#ChartDrReplicationRate").hide();
                                $("#divDrWrapperAdmin").hide();
                            }
                        } else {
                            VoltDbUI.isDRInfoRequired = false;
                            $("#divDrReplication").hide();
                            $('#liDrReplication').css('display', 'none');
                            $('#liDrTables').css('display', 'none');
                            showHideLastLineClass(false);
                            $("#ChartDrReplicationRate").hide();
                            $("#divDrWrapperAdmin").hide();
                        }
                    }
                });
            }
        });

        var showHideLastLineClass = function (showDrTable) {
            if (showDrTable) {
                $("#liTables").removeClass("last");
                $("#liDrTables").addClass("last");
            } else {
                $("#liTables").addClass("last");
                $("#liDrTables").removeClass("last");
            }
        };

        var loadProcedureInformations = function (procedureMetadata) {
            if ((procedureMetadata != "" && procedureMetadata != undefined)) {
                voltDbRenderer.mapProcedureInformation(currentProcedureAction, priorProcedureAction, function (traverse, htmlData) {
                    if (!voltDbRenderer.isProcedureSearch) {
                        if ((currentProcedureAction == VoltDbUI.ACTION_STATES.REFRESH && currentProcedureAction != VoltDbUI.ACTION_STATES.NONE) || (currentProcedureAction != VoltDbUI.ACTION_STATES.REFRESH && currentProcedureAction == VoltDbUI.ACTION_STATES.NONE)) {
                            lblTotalPages.innerHTML = voltDbRenderer.procedureDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureDataSize / voltDbRenderer.maxVisibleRows));

                        }

                        if (htmlData.SystemInformation[0] != "") {
                            if ((currentProcedureAction == VoltDbUI.ACTION_STATES.NONE || currentProcedureAction == VoltDbUI.ACTION_STATES.REFRESH) && priorProcedureAction == VoltDbUI.ACTION_STATES.NONE) //only during initial load
                                lblPrevious.innerHTML = " ".concat(1, ' ');

                            $('#storeProcedureBody').html(htmlData.SystemInformation);

                        } else {
                            lblPrevious.innerHTML = " ".concat(0, ' ');
                            lblTotalPages.innerHTML = " ".concat(0);
                            $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

                        }

                    }

                    if (currentProcedureAction == VoltDbUI.ACTION_STATES.SEARCH) {
                        priorProcedureAction = currentProcedureAction;
                    }

                    currentProcedureAction = VoltDbUI.ACTION_STATES.REFRESH;
                    VoltDbUI.CurrentProcedureDataProgress = VoltDbUI.DASHBOARD_PROGRESS_STATES.REFRESH_PROCEDUREDATA_NONE;

                });

            } else {
                lblPrevious.innerHTML = " ".concat(0, ' ');
                lblTotalPages.innerHTML = " ".concat(0);
                $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

                if (currentProcedureAction == VoltDbUI.ACTION_STATES.SEARCH) {
                    priorProcedureAction = currentProcedureAction;
                }

                currentProcedureAction = VoltDbUI.ACTION_STATES.REFRESH;
                VoltDbUI.CurrentProcedureDataProgress = VoltDbUI.DASHBOARD_PROGRESS_STATES.REFRESH_PROCEDUREDATA_NONE;

            }

        };

        voltDbRenderer.GetProceduresInfo(loadProcedureInformations);

        voltDbRenderer.getTablesInformation(function (tableMetadata) {
            if (tableMetadata != "" && tableMetadata != undefined) {
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {

                    if (!voltDbRenderer.isTableSearch) {
                        if ((currentTableAction == VoltDbUI.ACTION_STATES.REFRESH && currentTableAction != VoltDbUI.ACTION_STATES.NONE) || (currentTableAction != VoltDbUI.ACTION_STATES.REFRESH && currentTableAction == VoltDbUI.ACTION_STATES.NONE)) {
                            setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);

                        }

                        if (htmlData != "") {
                            if (currentTableAction == VoltDbUI.ACTION_STATES.NONE && currentTableAction == VoltDbUI.ACTION_STATES.NONE) //only during initial load
                            {
                                setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                            }
                            $('#tablesBody').html(htmlData);

                        } else {
                            setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                            $('#tablesBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");
                        }

                    }

                    if (currentTableAction == VoltDbUI.ACTION_STATES.SEARCH) {
                        priorTableAction = currentTableAction;
                    }
                    currentTableAction = VoltDbUI.ACTION_STATES.REFRESH;

                });

            } else {
                lblPreviousTable.innerHTML = " ".concat(0, ' ');
                lblTotalPagesofTables.innerHTML = " ".concat(0, ' ');
                $('#tablesBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

            }

        });

        $("#previousProcedures").unbind("click");
        $('#previousProcedures').on('click', function () {
            if (voltDbRenderer.procedureTableIndex >= 0) {
                currentProcedureAction = VoltDbUI.ACTION_STATES.PREVIOUS;
                voltDbRenderer.mapProcedureInformation(currentProcedureAction, priorProcedureAction, function (currentAction, htmlData) {
                    setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch);

                    if (!voltDbRenderer.isProcedureSearch) {
                        $('#storeProcedureBody').html(htmlData.SystemInformation);

                    } else {
                        $('#storeProcedureBody').html(htmlData);

                    }
                    priorProcedureAction = currentProcedureAction;


                });
                currentProcedureAction = VoltDbUI.ACTION_STATES.REFRESH;
            }
        });

        $("#nextProcedures").unbind("click");
        $('#nextProcedures').on('click', function () {
            var isValidAction = false;

            if (voltDbRenderer.isProcedureSearch) {
                isValidAction = !((voltDbRenderer.procedureTableIndex + 1) * voltDbRenderer.maxVisibleRows >= voltDbRenderer.procedureSearchDataSize);

            } else {
                isValidAction = !((voltDbRenderer.procedureTableIndex + 1) * voltDbRenderer.maxVisibleRows >= voltDbRenderer.procedureDataSize);
            }

            if (isValidAction) {
                currentProcedureAction = VoltDbUI.ACTION_STATES.NEXT;
                voltDbRenderer.mapProcedureInformation(currentProcedureAction, priorProcedureAction, function (currentAction, htmlData) {
                    setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch);
                    if (!voltDbRenderer.isProcedureSearch) {
                        $('#storeProcedureBody').html(htmlData.SystemInformation);

                    } else {
                        $('#storeProcedureBody').html(htmlData);
                    }
                    priorProcedureAction = currentAction;

                });
                currentProcedureAction = VoltDbUI.ACTION_STATES.REFRESH;
            }
        });

        $("#previousTables").unbind("click");
        $('#previousTables').on('click', function () {
            if (voltDbRenderer.tableIndex >= 0) {
                currentTableAction = VoltDbUI.ACTION_STATES.PREVIOUS;
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {
                    setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                    $('#tablesBody').html(htmlData);
                    priorTableAction = currentTableAction;
                    currentTableAction = VoltDbUI.ACTION_STATES.REFRESH;
                });



            }

        });

        $("#nextTables").unbind("click");
        $('#nextTables').on('click', function () {
            var isValidAction = false;
            voltDbRenderer.isNextClicked = true;

            if (voltDbRenderer.isTableSearch) {
                isValidAction = !((voltDbRenderer.tableIndex + 1) * voltDbRenderer.maxVisibleRows >= voltDbRenderer.tableSearchDataSize);

            } else {
                isValidAction = !((voltDbRenderer.tableIndex + 1) * voltDbRenderer.maxVisibleRows >= voltDbRenderer.tableDataSize);
            }

            if (isValidAction) {
                currentTableAction = VoltDbUI.ACTION_STATES.NEXT;
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {
                    setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);

                    if (!voltDbRenderer.isTableSearch && (htmlData != undefined && htmlData != "")) {
                        $('#tablesBody').html(htmlData);
                    }

                    else if (htmlData != undefined && htmlData != "") {
                        $('#tablesBody').html(htmlData);

                    }
                    priorTableAction = currentTableAction;
                    currentTableAction = VoltDbUI.ACTION_STATES.REFRESH;
                    voltDbRenderer.isNextClicked = false;
                });


            }

        });

        $("#filterStoredProc").unbind("click");
        $('#filterStoredProc').on('click', function () {
            if (this.value == defaultSearchTextProcedure)
                this.value = '';
        });

        $("#filterStoredProc").unbind("keyup");
        $('#filterStoredProc').on('keyup', function () {
            if (this.value != '' && this.value != defaultSearchTextProcedure) {
                voltDbRenderer.isProcedureSearch = true;
                currentProcedureAction = VoltDbUI.ACTION_STATES.SEARCH;

            }
            else {
                voltDbRenderer.isProcedureSearch = false;
                currentProcedureAction = VoltDbUI.ACTION_STATES.REFRESH;
            }

            if (voltDbRenderer.isProcedureSearch) {
                voltDbRenderer.searchProcedures('', this.value, function (searchResult) {
                    priorProcedureAction = currentProcedureAction;
                    currentProcedureAction = VoltDbUI.ACTION_STATES.SEARCH;

                    if (searchResult) {
                        if (voltDbRenderer.isSortProcedures)
                            voltDbRenderer.sortProceduresByColumns(true);

                        voltDbRenderer.mapProcedureInformation(currentProcedureAction, priorProcedureAction, function (traverse, htmlSearchData) {
                            if (htmlSearchData != "")
                                $('#storeProcedureBody').html(htmlSearchData);

                            else
                                $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

                            //set pagination
                            setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch, voltDbRenderer.procedureSearchDataSize);

                        });

                    } else {
                        $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");
                        setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch, voltDbRenderer.procedureSearchDataSize);
                    }
                    priorProcedureAction = VoltDbUI.ACTION_STATES.SEARCH;

                });
            } else {
                voltDbRenderer.mapProcedureInformation(currentProcedureAction, priorProcedureAction, function (traverse, htmlData) {
                    if (htmlData != "")
                        $('#storeProcedureBody').html(htmlData.SystemInformation);

                    else {
                        $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");
                    }

                    setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch);

                });

            }
        });

        $("#filterDatabaseTable").unbind("keyup");
        $('#filterDatabaseTable').on('keyup', function () {
            if ($('#filterDatabaseTable')[0].value != '' && $('#filterDatabaseTable')[0].value != defaultSearchTextTable) {
                voltDbRenderer.isTableSearch = true;
                voltDbRenderer.isSearchTextCleaned = false;
                currentTableAction = VoltDbUI.ACTION_STATES.SEARCH;

            } else {
                voltDbRenderer.isTableSearch = false;
                voltDbRenderer.isSearchTextCleaned = true;
                currentTableAction = VoltDbUI.ACTION_STATES.REFRESH;
            }

            if (voltDbRenderer.isTableSearch) {
                voltDbRenderer.GetDataTablesInformation(function (connection) {
                    voltDbRenderer.searchTables(connection, $('#filterDatabaseTable')[0].value, function (searchResult) {
                        priorTableAction = currentTableAction;
                        currentTableAction = VoltDbUI.ACTION_STATES.SEARCH;
                        if (searchResult) {
                            if (voltDbRenderer.isSortTables)
                                voltDbRenderer.sortTablesByColumns(true);

                            voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlSearchData) {
                                if (htmlSearchData != undefined) {
                                    $('#tablesBody').html(htmlSearchData);
                                }
                                setPaginationIndicesOfTables(voltDbRenderer.isTableSearch, "search");

                            });

                        } else {
                            $('#tablesBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");
                            setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                        }
                        priorTableAction = VoltDbUI.ACTION_STATES.SEARCH;

                    });
                });
            }
            else {
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {
                    if (htmlData != "") {
                        $('#tablesBody').html(htmlData);
                    } else {
                        $('#tablesBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");
                    }
                    setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);

                });
            }
        });

        $("#filterDatabaseTable").unbind("click");
        $('#filterDatabaseTable').on('click', function () {
            if (this.value == defaultSearchTextTable)
                this.value = '';

        });

    };

    var replicationWarning = function (count) {
        if (count == 0 || count == undefined) {
            $('#drWarning').hide();
            $('.alertIcon').hide();
        } else {
            $('#drWarning').show();
            $('.alertIcon').show();
            if (count == 1) {
                $('#drPartitionWarningMsg').text(count + ' partition is uncovered.');
            } else {
                $('#drPartitionWarningMsg').text(count + ' partitions are uncovered.');
            }
        }
    };

    var refreshDrMasterSection = function () {
        $("#drMasterSection").show();
        voltDbRenderer.GetDrDetails(function (drDetails) {
            var response = drDetails;

            var htmlcontent = "";
            var replicaLatencyMs = 0;
            var replicaLatencyTrans = 0;

            for (var key in response) {

                for (var i = 0; i <= response[key].length - 1; i++) {

                    replicaLatencyTrans = response[key][i].LASTQUEUEDDRID - response[key][i].LASTACKDRID;
                    replicaLatencyMs = (response[key][i].LASTQUEUEDTIMESTAMP - response[key][i].LASTACKTIMESTAMP) / 1000;

                    htmlcontent = htmlcontent + "<tr>";
                    htmlcontent = htmlcontent + "<td>" + key + "</td>" +
                        "<td>" + VoltDbUI.drStatus + "</td>" +
                        "<td>" + response[key][i].TOTALBUFFERS + "</td >" +
                        "<td>" + response[key][i].TOTALBYTES + "</td >" +
                        "<td>" + replicaLatencyMs + "</td >" +
                        "<td>" + replicaLatencyTrans + "</td >";
                    htmlcontent = htmlcontent + "</tr>";
                }

            }
            var leftScroll = $("#tblDrMAster_wrapper").find(".tblScroll").scrollLeft();
            if ($.fn.dataTable.isDataTable('#tblDrMAster')) {
                $("#tblDrMAster").DataTable().destroy();
            }

            var content = "<table width='100%' border='0' cellspacing='0' id='tblDrMAster' cellpadding='0' class='storeTbl drTbl no-footer dataTable' aria-describedby='tblDrMAster_info' role='grid'>" +
                "<thead><tr role='row'><th id='Th1' width='25%' data-name='none' class='' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1' aria-sort='ascending' aria-label='Partition ID: activate to sort column descending'>Partition ID</th>" +
                "<th id='Th2' width='20%' data-name='none' class='sorting' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1' >Status</th>" +
                "<th id='Th3' width='10%' data-name='none' class='sorting' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1' >Total Buffer</th>" +
                "<th id='Th4' width='10%' data-name='none' class='sorting' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1' >Buffer on disk</th>" +
                "<th id='Th5' width='15%' data-name='none' class='sorting' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1' >Replica Latency (ms)</th>" +
                "<th id='Th6' width='20%' data-name='none' class='sorting' tabindex='0' aria-controls='tblDrMAster' rowspan='1' colspan='1'>Replica latency (in transactions)</th></tr></thead><tbody>";
            $("#tblMAster_wrapper").find(".drMasterContainer").html(content + htmlcontent + "</tbody></table>");

            table = $("#tblDrMAster").DataTable({
                stateSave: true,
                pageLength: 5,
                "sPaginationType": "extStyleLF",
                "bAutoWidth": false,
                "language": {
                    "zeroRecords": "No data to be displayed"
                },
                "fnDrawCallback": function () {
                    if ($("#tblDrMAster").find("tbody tr td").first().html() == "No data to be displayed") {
                        $(this).parent().parent().find(".dataTables_paginate .navigationLabel .pageIndex").text("0");
                    } else {
                        $(this).parent().parent().find(".dataTables_paginate .navigationLabel .pageIndex").text(" " + this.fnPagingInfo().iPage + " ");
                    }

                    $(this).parent().parent().find(".dataTables_paginate .navigationLabel .totalPages").text(this.fnPagingInfo().iTotalPages);
                },

                "sDom": 'p<"tblScroll drScroll"t>',
                "aoColumns": [
                    null,
                    { "bSearchable": false },
                    { "bSearchable": false },
                    { "bSearchable": false },
                    { "bSearchable": false },
                    { "bSearchable": false }
                ]
            });



            // $("#tblDrMAster").wrap("<div class='tblScroll drScroll'>");
            //var org_html = $("#tblDrMAster")[0].outerHTML;
            ////console.log(org_html);
            //var new_html = "<div class='tblScroll drScroll'>" + org_html + "</div>";
            //$("#tblDrMAster_wrapper").find("table").replaceWith(new_html);

            $("#tblDrMAster_wrapper").find(".tblScroll").scrollLeft(leftScroll);

            $("#tblMAster_wrapper").find(".paginationDefault").remove();


            //Customizing DataTables to make it as existing pagination
            $(".paginate_disabled_previous").html("Prev");
            $(".paginate_enabled_next").html("Next");
            $(".paginate_disabled_next").html("Next");
            $(".paginate_enabled_previous").html("Prev");

            $(".paginate_disabled_previous").attr("title", "Previous Page");
            $(".paginate_enabled_next").attr("title", "Next Page");
            $(".paginate_disabled_next").attr("title", "Next Page");
            $(".paginate_enabled_previous").attr("title", "Previous Page");
        });

        $('#filterPartitionId').on('keyup', function () {
            table.search(this.value).draw();
        });
    };
    var replicaTable = '';
    var refreshDrReplicaSection = function (graphView, currentTab) {
        voltDbRenderer.GetDrReplicationInformation(function (replicationData) {

            MonitorGraphUI.RefreshDrReplicationGraph(replicationData, getCurrentServer(), graphView, currentTab);

            replicationWarning(replicationData["DR_GRAPH"]['WARNING_COUNT']);

            var response = replicationData["DR_GRAPH"]["REPLICATION_DATA"];

            var htmlcontent = "";
            // if (!$.isEmptyObject(response)) {
            for (var key in response) {
                htmlcontent = htmlcontent + "<tr>";
                htmlcontent = htmlcontent + "<td>" + response[key].HOST_ID + "</td>" +
                    "<td>" + response[key].STATE + "</td>" +
                    "<td>" + response[key].REPLICATION_RATE_1M + "</td >" +
                    "<td>" + response[key].REPLICATION_RATE_5M + "</td >";
                htmlcontent = htmlcontent + "</tr>";

            }

            var leftScroll = $("#tblDrReplica_wrapper").find(".tblScroll").scrollLeft();
            if ($.fn.dataTable.isDataTable('#tblDrReplica')) {
                $("#tblDrReplica").DataTable().destroy();
            }
            var content = " <table width='100%' border='0' cellspacing='0' id='tblDrReplica' cellpadding='0' class='storeTbl drTbl no-footer dataTable'><thead><tr><th id='Th7' width='25%' data-name='none'>Host ID</th><th id='Th8' width='25%' data-name='none'>Status</th><th id='Th9' width='25%' data-name='none'>Replication rate (last 1 minute)</th>" +
                                               "<th id='Th10' width='25%' data-name='none'>Replication rate (last 5 minutes)</th></tr></thead>" +
                                        "<tbody>";
            $("#drReplicaSection").find(".drReplicaContainer").html(content + htmlcontent + "</tbody></table>");

            replicaTable = $("#tblDrReplica").DataTable({
                stateSave: true,
                pageLength: 5,
                "sPaginationType": "extStyleLF",
                "bAutoWidth": false,
                "language": {
                    "zeroRecords": "No data to be displayed"
                },
                "fnDrawCallback": function () {

                    if ($("#tblDrReplica").find("tbody tr td").first().html() == "No data to be displayed") {
                        $(this).parent().parent().find(".dataTables_paginate .navigationLabel .pageIndex").text("0");
                    } else {
                        $(this).parent().parent().find(".dataTables_paginate .navigationLabel .pageIndex").text(" " + this.fnPagingInfo().iPage + " ");
                    }


                    $(this).parent().parent().find(".dataTables_paginate .navigationLabel .totalPages").text(this.fnPagingInfo().iTotalPages);
                },
                "sDom": 'p<"tblScroll drScroll"t>',
                "aoColumns": [
                    null,
                    { "bSearchable": false },
                    { "bSearchable": false },
                    { "bSearchable": false }
                ]
            });

            $("#tblDrReplica_wrapper").find(".tblScroll").scrollLeft(leftScroll);
            $("#tblReplica_wrapper").find(".paginationDefault").remove();

            //  Customizing DataTables to make it as existing pagination
            $(".paginate_disabled_previous").html("Prev");
            $(".paginate_enabled_next").html("Next");
            $(".paginate_disabled_next").html("Next");
            $(".paginate_enabled_previous").html("Prev");

            $(".paginate_disabled_previous").attr("title", "Previous Page");
            $(".paginate_enabled_next").attr("title", "Next Page");
            $(".paginate_disabled_next").attr("title", "Next Page");
            $(".paginate_enabled_previous").attr("title", "Previous Page");
            $(".paginate_enabled_previous").attr("title", "Previous Page");

            //  }
        });

        $('#filterHostID').on('keyup', function () {
            replicaTable.search(this.value).draw();
        });
    };

    var setPaginationIndicesOfProcedures = function (isProcedureSearch) {
        if (isProcedureSearch) {
            if (voltDbRenderer.procedureSearchDataSize > 0) {
                if (currentProcedureAction == VoltDbUI.ACTION_STATES.NEXT && priorProcedureAction == VoltDbUI.ACTION_STATES.SEARCH) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));

                }
                else if ((currentProcedureAction == VoltDbUI.ACTION_STATES.PREVIOUS && priorProcedureAction == VoltDbUI.ACTION_STATES.SEARCH)) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));

                }

                else if (currentProcedureAction == VoltDbUI.ACTION_STATES.NEXT && priorProcedureAction == VoltDbUI.ACTION_STATES.PREVIOUS) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));

                }
                else if (currentProcedureAction == VoltDbUI.ACTION_STATES.NEXT && priorProcedureAction == VoltDbUI.ACTION_STATES.NEXT) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));

                }
                else if (currentProcedureAction == VoltDbUI.ACTION_STATES.PREVIOUS && priorProcedureAction == VoltDbUI.ACTION_STATES.NEXT) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));

                }
                else {
                    lblPrevious.innerHTML = " ".concat(1, ' ');
                    lblTotalPages.innerHTML = voltDbRenderer.procedureSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureSearchDataSize / voltDbRenderer.maxVisibleRows));
                }


            } else {
                lblPrevious.innerHTML = " ".concat(0, ' ');
                lblTotalPages.innerHTML = " ".concat(0);

            }

        } else {
            if (voltDbRenderer.procedureDataSize > 0) {
                if (currentProcedureAction == VoltDbUI.ACTION_STATES.NEXT) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                }
                else if (currentProcedureAction == VoltDbUI.ACTION_STATES.PREVIOUS) {
                    lblPrevious.innerHTML = " ".concat(voltDbRenderer.procedureTableIndex + 1, ' ');
                }
                else {
                    lblPrevious.innerHTML = " ".concat(1, ' ');
                }
                lblTotalPages.innerHTML = voltDbRenderer.procedureDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.procedureDataSize / voltDbRenderer.maxVisibleRows));

            } else {
                lblPrevious.innerHTML = " ".concat(0, ' ');
                lblTotalPages.innerHTML = " ".concat(0);

            }
        }

    };

    var setPaginationIndicesOfTables = function (isTableSearch) {
        //set pagination
        if (isTableSearch) {
            if (voltDbRenderer.tableSearchDataSize > 0) {
                if (currentTableAction == VoltDbUI.ACTION_STATES.NEXT &&
                    (priorTableAction == VoltDbUI.ACTION_STATES.SEARCH || priorTableAction == VoltDbUI.ACTION_STATES.PREVIOUS || priorTableAction == VoltDbUI.ACTION_STATES.NEXT)) {
                    lblPreviousTable.innerHTML = " ".concat(voltDbRenderer.tableIndex + 1, ' ');
                    lblTotalPagesofTables.innerHTML = voltDbRenderer.tableSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableSearchDataSize / voltDbRenderer.maxVisibleRows));


                } else if ((currentTableAction == VoltDbUI.ACTION_STATES.PREVIOUS && priorTableAction == VoltDbUI.ACTION_STATES.SEARCH || priorTableAction == VoltDbUI.ACTION_STATES.PREVIOUS)) {
                    lblPreviousTable.innerHTML = " ".concat(voltDbRenderer.tableIndex + 1, ' ');
                    lblTotalPagesofTables.innerHTML = voltDbRenderer.tableSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableSearchDataSize / voltDbRenderer.maxVisibleRows));

                } else if (currentTableAction == VoltDbUI.ACTION_STATES.PREVIOUS && priorTableAction == VoltDbUI.ACTION_STATES.NEXT) {
                    lblPreviousTable.innerHTML = " ".concat(voltDbRenderer.tableIndex + 1, ' ');
                    lblTotalPagesofTables.innerHTML = voltDbRenderer.tableSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableSearchDataSize / voltDbRenderer.maxVisibleRows));

                }

                else if (currentTableAction == VoltDbUI.ACTION_STATES.REFRESH && (priorTableAction == VoltDbUI.ACTION_STATES.PREVIOUS || priorTableAction == VoltDbUI.ACTION_STATES.NEXT)) {
                    lblTotalPagesofTables.innerHTML = voltDbRenderer.tableSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableSearchDataSize / voltDbRenderer.maxVisibleRows));
                }
                else {
                    lblPreviousTable.innerHTML = " ".concat(1, ' ');
                    lblTotalPagesofTables.innerHTML = voltDbRenderer.tableSearchDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableSearchDataSize / voltDbRenderer.maxVisibleRows));
                }

            }
            else {
                lblPreviousTable.innerHTML = " ".concat(0, ' ');
                lblTotalPagesofTables.innerHTML = " ".concat(0, ' ');

            }

        }
        else {
            if (voltDbRenderer.tableDataSize > 0) {
                if (currentTableAction == VoltDbUI.ACTION_STATES.NEXT) {
                    lblPreviousTable.innerHTML = " ".concat(voltDbRenderer.tableIndex + 1, ' ');
                }
                else if (currentTableAction == VoltDbUI.ACTION_STATES.PREVIOUS) {
                    lblPreviousTable.innerHTML = " ".concat(voltDbRenderer.tableIndex + 1, ' ');

                } else if ((currentTableAction == VoltDbUI.ACTION_STATES.REFRESH || currentTableAction == VoltDbUI.ACTION_STATES.NONE) &&
                    (voltDbRenderer.isSearchTextCleaned || !(priorTableAction == VoltDbUI.ACTION_STATES.PREVIOUS || priorTableAction == VoltDbUI.ACTION_STATES.NEXT))) {
                    lblPreviousTable.innerHTML = " ".concat(1, ' ');
                    voltDbRenderer.isSearchTextCleaned = false;

                }
                else if (voltDbRenderer.isTableSortClicked) {
                    lblPreviousTable.innerHTML = " ".concat(1, ' ');
                }
                lblTotalPagesofTables.innerHTML = voltDbRenderer.tableDataSize < voltDbRenderer.maxVisibleRows ? " ".concat(1) : " ".concat(Math.ceil(voltDbRenderer.tableDataSize / voltDbRenderer.maxVisibleRows));


            } else {
                lblPreviousTable.innerHTML = " ".concat(0, ' ');
                lblTotalPagesofTables.innerHTML = " ".concat(0, ' ');

            }
        }
    };


    var saveThreshold = function () {

        var defaultThreshold = 70;
        var thresholdInput = $("#threshold");

        if (thresholdInput.val() == "") {
            thresholdInput.val(defaultThreshold);
        }

        if ($.cookie("alert-threshold") == undefined || $.cookie("alert-threshold") == null) {
            saveCookie("alert-threshold", defaultThreshold);
        }

        $("#saveThreshold").on("click", function () {

            if (thresholdInput.val() == "" || thresholdInput.val() * 1 > 100) {
                alert("The value of \"Alert Threshold\" should be between 0 and 100.");
                return false;
            }

            var thresholdValue = (thresholdInput.val() != "") ? thresholdInput.val() : defaultThreshold;
            saveCookie("alert-threshold", thresholdValue);
            refreshClusterHealth();
            $("#popServerList").hide();
            $("#overlay").show();
            $('#btnPopServerList').removeClass('hideServers');
            $('#btnPopServerList').addClass('showServers');
            return true;
        });

        $("#threshold").on("keypress", function (e) {
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                return false;
            }
            return true;

        });

        //Set the value of threshold
        $("#threshold").val($.cookie("alert-threshold"));

    };

    if ($.cookie("graph-view") == undefined || $.cookie("graph-view") == null)
        saveCookie("graph-view", $("#graphView").val());

    $("#graphView").val($.cookie("graph-view"));
    MonitorGraphUI.AddGraph($.cookie("graph-view"), $('#chartServerCPU'), $('#chartServerRAM'), $('#chartClusterLatency'), $('#chartClusterTransactions'), $('#chartPartitionIdleTime'), $('#ChartDrReplicationRate'));

    $('#PROCEDURE,#INVOCATIONS,#MIN_LATENCY,#MAX_LATENCY,#AVG_LATENCY,#AVG_LATENCY,#PERC_EXECUTION').unbind('click');
    $('#PROCEDURE,#INVOCATIONS,#MIN_LATENCY,#MAX_LATENCY,#AVG_LATENCY,#PERC_EXECUTION').on('click', function () {
        voltDbRenderer.isProcedureSortClicked = true;
        currentProcedureAction = VoltDbUI.ACTION_STATES.SORT;

        if (this.id != 'PROCEDURE') {
            $("#tblStoredProcedures").find('#PROCEDURE').attr('data-name', 'none');
            $("#tblStoredProcedures").find('#PROCEDURE').removeAttr('class');
        }

        if (VoltDbUI.sortStatus == VoltDbUI.SORT_STATES.NONE || VoltDbUI.sortStatus == VoltDbUI.SORT_STATES.SORTED) {
            if ($(this).data('name') == "none") {
                $(this).data('name', 'ascending');
                voltDbRenderer.sortOrder = "ascending";

            }
            else if ($(this).data('name') == "ascending") {
                voltDbRenderer.sortOrder = "descending";
                $(this).data('name', 'descending');

            } else if ($(this).data('name') == "descending") {
                voltDbRenderer.sortOrder = "ascending";
                $(this).data('name', 'ascending');

            }

            //apply css to display sort arrow image
            if ($(this).hasClass("sorttable_sorted")) {
                if (this.id == voltDbRenderer.sortColumn)
                    $("#" + voltDbRenderer.sortColumn).data('name', 'descending');
                else
                    $("#" + voltDbRenderer.sortColumn).data('name', 'none');


                $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted");
                $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted_reverse");

                $(this).removeClass("sorttable_sorted");
                $(this).addClass("sorttable_sorted_reverse");


            } else if ($(this).hasClass("sorttable_sorted_reverse")) {
                if (this.id == voltDbRenderer.sortColumn)
                    $("#" + voltDbRenderer.sortColumn).data('name', 'ascending');
                else
                    $("#" + voltDbRenderer.sortColumn).data('name', 'none');

                $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted");
                $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted_reverse");

                $(this).removeClass("sorttable_sorted_reverse");
                $(this).addClass("sorttable_sorted");

            } else {
                $(this).addClass("sorttable_sorted");
                if ($("#" + voltDbRenderer.sortColumn) != undefined) {
                    $("#" + voltDbRenderer.sortColumn).data('name', 'none');
                    $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted");
                    $("#" + voltDbRenderer.sortColumn).removeClass("sorttable_sorted_reverse");
                }

            }

            voltDbRenderer.isSortProcedures = true;
            voltDbRenderer.sortColumn = this.id;

            if (voltDbRenderer.isProcedureSearch) {
                VoltDbUI.sortStatus = VoltDbUI.SORT_STATES.SORTING;
                voltDbRenderer.searchProcedures('', $('#filterStoredProc')[0].value, function (searchResult) {
                    currentProcedureAction = VoltDbUI.ACTION_STATES.SORT;
                    voltDbRenderer.formatSearchDataToJsonArray();
                    if (voltDbRenderer.sortProceduresByColumns(false)) {
                        voltDbRenderer.mapProcedureInformationSorting(currentProcedureAction, priorProcedureAction, function (htmlData) {
                            if (htmlData != "")
                                $('#storeProcedureBody').html(htmlData);

                            else
                                $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

                            //set pagination
                            setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch);
                            VoltDbUI.sortStatus = VoltDbUI.SORT_STATES.SORTED;

                        });

                    } else {
                        VoltDbUI.sortStatus = VoltDbUI.SORT_STATES.NONE;
                    }
                    priorProcedureAction = VoltDbUI.ACTION_STATES.SEARCH;

                });
            } else {
                VoltDbUI.sortStatus = VoltDbUI.SORT_STATES.SORTING;
                voltDbRenderer.sortProceduresByColumns(false);
                voltDbRenderer.mapProcedureInformationSorting(currentProcedureAction, priorProcedureAction, function (htmlData) {
                    if (htmlData != "")
                        $('#storeProcedureBody').html(htmlData);

                    else
                        $('#storeProcedureBody').html("<tr><td colspan=6> No data to be displayed</td></tr>");

                    setPaginationIndicesOfProcedures(voltDbRenderer.isProcedureSearch);
                    VoltDbUI.sortStatus = VoltDbUI.SORT_STATES.SORTED;

                });

            }

        }
        voltDbRenderer.isProcedureSortClicked = false;
    });

    $('#TABLE_NAME,#TUPLE_COUNT,#MAX_ROWS,#MIN_ROWS,#AVG_ROWS,#TABLE_TYPE').unbind('click');
    $('#TABLE_NAME,#TUPLE_COUNT,#MAX_ROWS,#MIN_ROWS,#AVG_ROWS,#TABLE_TYPE').on('click', function () {
        voltDbRenderer.isTableSortClicked = true;

        if (this.id != 'TABLE_NAME') {
            $("#tblDataTables").find('#TABLE_NAME').attr('data-name', 'none');
            $("#tblDataTables").find('#TABLE_NAME').removeAttr('class');
        }
        if (VoltDbUI.tableSortStatus == VoltDbUI.SORT_STATES.NONE || VoltDbUI.tableSortStatus == VoltDbUI.SORT_STATES.SORTED) {
            if ($(this).data('name') == "none") {
                $(this).data('name', 'ascending');
                voltDbRenderer.sortTableOrder = "ascending";

            }
            else if ($(this).data('name') == "ascending") {
                voltDbRenderer.sortTableOrder = "descending";
                $(this).data('name', 'descending');

            } else if ($(this).data('name') == "descending") {
                voltDbRenderer.sortTableOrder = "ascending";
                $(this).data('name', 'ascending');

            }

            //apply css to display sort arrow image
            if ($(this).hasClass("sorttable_sorted")) {
                if (this.id == voltDbRenderer.tableSortColumn) {
                    $("#" + voltDbRenderer.tableSortColumn).data('name', 'descending');
                } else
                    $("#" + voltDbRenderer.tableSortColumn).data('name', 'none');


                $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted");
                $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted_reverse");

                $(this).removeClass("sorttable_sorted");
                $(this).addClass("sorttable_sorted_reverse");


            } else if ($(this).hasClass("sorttable_sorted_reverse")) {
                if (this.id == voltDbRenderer.tableSortColumn)
                    $("#" + voltDbRenderer.tableSortColumn).data('name', 'ascending');
                else
                    $("#" + voltDbRenderer.tableSortColumn).data('name', 'none');

                $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted");
                $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted_reverse");

                $(this).removeClass("sorttable_sorted_reverse");
                $(this).addClass("sorttable_sorted");

            } else {
                $(this).addClass("sorttable_sorted");
                if ($("#" + voltDbRenderer.tableSortColumn) != undefined) {
                    $("#" + voltDbRenderer.tableSortColumn).data('name', 'none');
                    $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted");
                    $("#" + voltDbRenderer.tableSortColumn).removeClass("sorttable_sorted_reverse");
                }

            }


            voltDbRenderer.isSortTables = true;
            voltDbRenderer.tableSortColumn = this.id;

            if (voltDbRenderer.isTableSearch) {
                VoltDbUI.tableSortStatus = VoltDbUI.SORT_STATES.SORTING;
                priorTableAction = currentTableAction;
                currentTableAction = VoltDbUI.ACTION_STATES.SEARCH;
                voltDbRenderer.sortTablesByColumns();
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {
                    if ((htmlData != undefined && htmlData != "")) {
                        $('#tablesBody').html(htmlData);
                    }

                    //set pagination
                    setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                    VoltDbUI.tableSortStatus = VoltDbUI.SORT_STATES.SORTED;
                    voltDbRenderer.isTableSortClicked = false;

                });
                priorTableAction = VoltDbUI.ACTION_STATES.SEARCH;

            } else {
                VoltDbUI.tableSortStatus = VoltDbUI.SORT_STATES.SORTING;
                voltDbRenderer.sortTablesByColumns();
                voltDbRenderer.mapTableInformation(currentTableAction, priorTableAction, voltDbRenderer.isTableSearch, function (htmlData) {
                    if ((htmlData != undefined && htmlData != "")) {
                        $('#tablesBody').html(htmlData);
                    }

                    setPaginationIndicesOfTables(voltDbRenderer.isTableSearch);
                    VoltDbUI.tableSortStatus = VoltDbUI.SORT_STATES.SORTED;
                    voltDbRenderer.isTableSortClicked = false;
                });

            }
        }

    });


    $("#graphView").on("change", function () {
        var graphView = $("#graphView").val();
        saveCookie("graph-view", graphView);
        MonitorGraphUI.RefreshGraph(graphView);
        MonitorGraphUI.UpdateCharts();
    });

    //slides the element with class "menu_body" when paragraph with class "menu_head" is clicked
    $("#firstpane div.menu_head").click(function () {
        var userPreferences = getUserPreferences();
        if (userPreferences != null) {
            if (userPreferences['DatabaseTables'] != false || userPreferences['StoredProcedures'] != false) {
                var headerState = $("#firstpane div.menu_body").css('display');
                if (headerState == 'none') {
                    $(this).removeClass('collapsed');
                    $(this).addClass('expanded');
                } else {
                    $(this).removeClass('expanded');
                    $(this).addClass('collapsed');
                }
                $(this).next("div.menu_body").slideToggle(300).siblings("div.menu_body").slideUp("slow");
            }
        } else {

            $('ul.user-preferences > li Input:checkbox').each(function (value) {
                userPreferences[$(this)[0].id] = true;
            });
            saveUserPreferences(userPreferences);

            $(this).removeClass('collapsed');
            $(this).addClass('expanded');
            $(this).next("div.menu_body").slideToggle(300).siblings("div.menu_body").slideUp("slow");

        }

    });

    refreshClusterHealth();
    refreshGraphAndData($.cookie("graph-view"), VoltDbUI.CurrentTab);
    setInterval(refreshClusterHealth, 5000);
    setInterval(function () {
        refreshGraphAndData($.cookie("graph-view"), VoltDbUI.CurrentTab);
    }, 5000);


    //refreshGraphAndDataInLoop(getRefreshTime(), $.cookie("graph-view"));
    configureUserPreferences();
    adjustGraphSpacing();
    saveThreshold();

    $('#showMyHelp').popup();
    $("#conPopup").popup({
        closeDialog: function () {
            VoltDbUI.isConnectionChecked = false;
            VoltDbUI.refreshConnectionTime('20000');
            $('#connectionPopup').hide();
        }
    });

    VoltDbUI.refreshConnectionTime('20000');
};


/*********************************************************************************************
/Configure My Graph dialog
/*********************************************************************************************/
var configureUserPreferences = function () {
    var userPreference = {};
    userPreference["serverCPU"] = {};
    userPreference["serverRAM"] = {};
    userPreference["clusterLatency"] = {};
    userPreference["clusterTransactions"] = {};
    userPreference["partitionIdleTime"] = {};
    userPreference["storedProcedures "] = {};
    userPreference["databaseTables "] = {};

    $('#showMyPreference').popup(
        {
            open: function (event, ui, ele) {
                userPreference = getUserPreferences();
                $('ul.user-preferences > li Input:checkbox').each(function (value) {
                    $(this)[0].checked = userPreference[$(this)[0].id];
                });
            },
            save: function () {
                $('ul.user-preferences > li Input:checkbox').each(function (value) {
                    userPreference[$(this)[0].id] = $(this)[0].checked;

                });
                saveUserPreferences(userPreference);

                MonitorGraphUI.UpdateCharts();
            }

        });



};


/*******************************************************************************************
//common methods
/*******************************************************************************************/

var isNodeButtonRegistered = function (elementName) {
    var isRegistered = false;
    var elementCount = 0;
    if (VoltDbAdminConfig.registeredElements != undefined && VoltDbAdminConfig.registeredElements.length > 0) {
        $.each(VoltDbAdminConfig.registeredElements, function (key, value) {
            if (value == elementName) {
                isRegistered = true;
                return false;
            }
            else if (elementCount == VoltDbAdminConfig.registeredElements.length - 1) {
                isRegistered = false;
            }
            elementCount++;
        });

    } else
        isRegistered = false;

    return isRegistered;
};


//Dummy wrapper for console.log for IE9
if (!(window.console && console.log)) {
    console = {
        log: function () { },
        debug: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
}

var saveCookie = function (name, value) {
    $.cookie(name, value, { expires: 365 });
};

var saveSessionCookie = function (name, value) {
    $.cookie(name, value);
};

var saveUserPreferences = function (preferences) {
    var lPreferences = preferences;
    saveCookie("user-preferences", JSON.stringify(preferences));
    showHideGraph(lPreferences);
};

var NavigationTabs = {
    DBMonitor: 1,
    Admin: 2,
    Schema: 3,
    SQLQuery: 4
};

var getCurrentTab = function () {
    var activeLinkId = "";
    var activeLink = $("#nav .active");
    if (activeLink.length > 0) {
        activeLinkId = activeLink.attr("id");
    }

    if (activeLinkId == "navSqlQuery")
        return NavigationTabs.SQLQuery;

    else if (activeLinkId == "navSchema")
        return NavigationTabs.Schema;

    else if (activeLinkId == "navAdmin")
        return NavigationTabs.Admin;

    return NavigationTabs.DBMonitor;
};

var getUserPreferences = function () {
    try {
        voltDbRenderer.userPreferences = $.parseJSON($.cookie("user-preferences"));
    } catch (e) {

        voltDbRenderer.userPreferences = {};
        var preferencesList = ["ServerCPU", "ServerRAM", "ClusterLatency", "ClusterTransactions", "StoredProcedures", "DatabaseTables", "PartitionIdleTime", "DrReplicationRate", "DRTables"];
        for (var i = 0; i < preferencesList.length; i++) {
            voltDbRenderer.userPreferences[preferencesList[i]] = true;
        }
    }
    return voltDbRenderer.userPreferences;
};

var saveCurrentServer = function (serverName) {
    saveCookie("currentServer", serverName);
};

var getCurrentServer = function () {
    return $.cookie("currentServer");

};

var showHideGraph = function (userpreferences) {
    if (userpreferences["ServerCPU"] == false)
        $("#chartServerCPU").hide();
    else
        $("#chartServerCPU").show();

    if (userpreferences["ServerRAM"] == false)
        $("#chartServerRAM").hide();
    else
        $("#chartServerRAM").show();

    if (userpreferences["ClusterLatency"] == false)
        $("#chartClusterLatency").hide();
    else
        $("#chartClusterLatency").show();

    if (userpreferences["ClusterTransactions"] == false)
        $("#chartClusterTransactions").hide();
    else
        $("#chartClusterTransactions").show();

    if (userpreferences["PartitionIdleTime"] == false)
        $("#chartPartitionIdleTime").hide();
    else
        $("#chartPartitionIdleTime").show();

    if (userpreferences["DrReplicationRate"] == false || VoltDbUI.isFirstHit == true || VoltDbUI.drReplicationRole.toLowerCase() != "replica")
        $("#ChartDrReplicationRate").hide();
    else
        $("#ChartDrReplicationRate").show();

    if (userpreferences["StoredProcedures"] == false)
        $("#tblStoredProcedures").hide();
    else
        $("#tblStoredProcedures").show();

    if (userpreferences["DatabaseTables"] == false)
        $("#tblDataTables").hide();
    else
        $("#tblDataTables").show();

    if (userpreferences["DatabaseTables"] == false && userpreferences["StoredProcedures"] == false)
        $("#firstpane").hide();
    else
        $("#firstpane").show();

    if (userpreferences["DRTables"] == false || VoltDbUI.isFirstHit == true) {
        $("#divDrReplication").hide();
    } else {
        $("#divDrReplication").show();
    }

    adjustGraphSpacing();
    ChangeGraphLabelColor();
    ChangeTableProcedureLabelColor();
};

function ChangeGraphLabelColor() {
    if ($.cookie("user-preferences") != undefined) {
        var userPreferences = $.parseJSON($.cookie("user-preferences"));
        if (userPreferences['ClusterLatency'] != false || userPreferences['ClusterTransactions'] != false || userPreferences['ServerCPU'] != false || userPreferences['ServerRAM'] != false || userPreferences["PartitionIdleTime"] != false || userPreferences["DrReplicationRate"] != false) {
            $('#showHideGraphBlock').css('color', '#000000');
            $("#GraphBlock").removeClass("graphOpacity");
        } else {
            $('#showHideGraphBlock').css('color', 'gray');
            $("#GraphBlock").addClass("graphOpacity");
        }
    }
}

function ChangeTableProcedureLabelColor() {
    if ($.cookie("user-preferences") != undefined) {
        var userPreferences = $.parseJSON($.cookie("user-preferences"));
        if (userPreferences['DatabaseTables'] != false || userPreferences['StoredProcedures'] != false || userPreferences['DRTables'] != false) {
            $('#ShowHideBlock').css('color', '#000000');
        } else {
            $('#ShowHideBlock').css('color', 'gray');
        }
    }
}

// Graph Spacing adjustment on preference change
var adjustGraphSpacing = function () {
    var graphList = [$("#chartServerCPU"), $("#chartServerRAM"), $("#chartClusterLatency"), $("#chartClusterTransactions"), $("#chartPartitionIdleTime")];

    var css = "left";

    for (var i = 0; i < graphList.length; i++) {
        if (graphList[i].is(':visible')) {
            graphList[i].removeClass("left right");
            graphList[i].addClass(css);

            if (css == "left")
                css = "right";
            else
                css = "left";
        }
    }
};

(function (window) {
    var iVoltDbUi = (function () {
        this.isSchemaTabLoading = false;
        this.isFirstHit = true;
        this.drMasterEnabled = false;
        this.drStatus = '';
        this.drReplicationRole = "NONE";
        this.isDRInfoRequired = false;
        this.ACTION_STATES = {
            NONE: -1,
            NEXT: 0,
            PREVIOUS: 1,
            REFRESH: 2,
            SEARCH: 3,
            SORT: 4
        };

        this.SORT_STATES = {
            NONE: 0,
            SORTING: 1,
            SORTED: 2
        };

        this.DASHBOARD_PROGRESS_STATES = {
            REFRESHMEMORY: 0,
            REFRESHMEMORY_NONE: 1,
            REFRESHCPU: 2,
            REFRESHCPU_NONE: 3,
            REFRESHLATENCY: 4,
            REFRESHLATENCY_NONE: 5,
            REFRESHTRANSACTION: 6,
            REFRESHTRANSACTION_NONE: 7,

            REFRESH_PROCEDUREDATA: 8,
            REFRESH_PROCEDUREDATA_NONE: 9,
            REFRESH_TABLEDATA: 10,
            REFRESH_TABLEDATA_NONE: 11
        };

        this.popups = [];
        this.isPopupRevoked = false;

        this.CurrentTab = NavigationTabs.DBMonitor;

        this.CurrentMemoryProgess = this.DASHBOARD_PROGRESS_STATES.REFRESHMEMORY_NONE;
        this.CurrentCpuProgess = this.DASHBOARD_PROGRESS_STATES.REFRESHCPU_NONE;
        this.CurrentLatencyProgess = this.DASHBOARD_PROGRESS_STATES.REFRESHLATENCY_NONE;
        this.CurrentTransactionProgess = this.DASHBOARD_PROGRESS_STATES.REFRESHTRANSACTION_NONE;
        this.CurrentTableDataProgress = this.DASHBOARD_PROGRESS_STATES.REFRESH_TABLEDATA_NONE;
        this.CurrentProcedureDataProgress = this.DASHBOARD_PROGRESS_STATES.REFRESH_PROCEDUREDATA_NONE;
        this.sortStatus = this.SORT_STATES.NONE;
        this.tableSortStatus = this.SORT_STATES.NONE;
        this.isConnectionChecked = false;
        this.connectionTimeInterval = null;
        this.partitionGraphInterval = null;
        //load schema tab and table and views tabs inside sql query
        this.refreshSqlAndSchemaTab = function () {
            this.loadSchemaTab();
            SQLQueryRender.populateTablesAndViews();
        };
        this.hasPermissionToView = true;

        this.refreshConnectionTime = function (seconds) {
            if (VoltDbUI.connectionTimeInterval != null)
                window.clearInterval(VoltDbUI.connectionTimeInterval);

            VoltDbUI.connectionTimeInterval = window.setInterval(checkServerConnection, seconds);
        };

        var checkServerConnection = function () {
            if (!VoltDbUI.isConnectionChecked) {
                VoltDbUI.isConnectionChecked = true;
                voltDbRenderer.CheckServerConnection(
                    function (result) {
                        if (result == false) {
                            VoltDBCore.isServerConnected = false;
                            if (!$('#conpop').is(':visible') && !$('#shutdownPop').is(':visible')) {
                                window.clearInterval(VoltDbUI.connectionTimeInterval);
                                $('#conPopup').click();
                            }
                        } else {
                            VoltDbUI.isConnectionChecked = false;
                        }
                    }
                );
            }
        };

        this.loadSchemaTab = function () {
            this.isSchemaTabLoading = true;

            var schemaHtml = '<div id="schemaOverlay" style="display: block;"><div class="loading"></div></div>';
            schemaHtml = schemaHtml + $('#schema').html();
            $('#schema').html(schemaHtml);

            var templateUrl = window.location.protocol + '//' + window.location.host + '/catalog';
            var templateJavascript = "js/template.js";


            $.post(templateUrl, function (result) {
                result = result.replace('<!--##SIZES##>', '');
                var body = $(result).filter("#wrapper").html();
                $("#schema").html(body);
                $("#overlay").hide();
                $("#schemaLinkSqlQuery").on("click", function (e) {
                    $("#navSqlQuery").trigger("click");
                    e.preventDefault();
                });

                $.getScript(templateJavascript, function () {
                    $('.schm').css("display", "block");
                    $('.refreshBtn').unbind("click");
                    $('.refreshBtn.schm').unbind("click");
                    $('.refreshBtn.schm,.refreshBtn').click(function () {
                        VoltDbUI.refreshSqlAndSchemaTab();

                    });
                    VoltDbUI.isSchemaTabLoading = false;
                });

            });

        };

    });
    window.VoltDbUI = VoltDbUi = new iVoltDbUi();

})(window);


function RefreshServerUI() {
    var clickedServer = window.location.hostname;
    if (clickedServer != "") {
        $('.activeServerName').html(clickedServer).attr('title', clickedServer);
        saveCurrentServer(clickedServer);

        $('#popServerList').toggle('slide', '', 1500);
        $(this).parent().prevAll().removeClass('monitoring');
        $(this).parent().nextAll().removeClass('monitoring');
        $(this).parent().addClass('monitoring');

        $('#btnPopServerList').removeClass('hideServers');
        $('#btnPopServerList').addClass('showServers');

        $("#popServerList").hide();

    }

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
