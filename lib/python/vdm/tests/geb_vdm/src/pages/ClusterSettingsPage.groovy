/*
This file is part of VoltDB.

Copyright (C) 2008-2015 VoltDB Inc.

This file contains original code and/or modifications of original code.
Any modifications made by VoltDB Inc. are licensed under the following
terms and conditions:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import geb.Page

class ClusterSettingsPage extends Page {
    static content = {
        // Tabs
        clusterSettingsTab              { $("#dbManager") }
        serverSettingsTab               { $("#serverSetting") }

        // DB
        startCluster                    { $("#divDbManager > div.clusterContent > div.clusterStartStop > div > a") }

        // Servers
        buttonAddServer                 { $("#btnAddServer") }
        btnAddServerOption              { $("#btnAddServerOption") }

        // Add Server Popup
        popupAddServer                          { $("#addServer > div > div") }
        popupAddServerNameField                 { $("#serverName") }
        popupAddServerHostNameField             { $("#txtHostName") }
        popupAddServerDescriptionField          { $("#txtDescription") }
        popupAddServerClientListenerField       { $("#txtClientPort") }
        popupAddServerAdminListenerField        { $("#txtAdminPort") }
        popupAddServerHttpListenerField         { $("#txtHttpPort") }
        popupAddServerInternalListenerField     { $("#txtInternalPort") }
        popupAddServerZookeeperListenerField    { $("#txtZookeeper") }
        popupAddServerReplicationListenerField  { $("#txtReplicationPort") }
        popupAddServerInternalInterfaceField    { $("#txtInternalInterface") }
        popupAddServerExternalInterfaceField    { $("#txtExternalInterface") }
        popupAddServerPublicInterfaceField      { $("#txtPublicInterface") }
        popupAddServerPlacementGroupField       { $("#txtPlacementGroup") }

        popupAddServerButtonOk              { $("#btnCreateServerOk") }
        popupAddServerButtonCancel          { $("#addServer > div > div > div.modal-footer > button.btn.btn-gray") }

        // Delete Server
        deleteServer                        { $("#serverList > tbody > tr:nth-child(5) > td:nth-child(2) > a > div") }
        popupDeleteServer                   { $("#deleteConfirmation > div > div") }
        popupDeleteServerButtonOk           { $("#deleteServerOk") }

        testingPath                         (required:false) { $("#serverList > tbody > tr:nth-child(5) > td:nth-child(1)") }
        errorServerName                     {$("#errorServerName")}
        errorHostName                       {$("#errorHostName")}
        errorClientPort                     {$("#errorClientPort")}
        errorInternalInterface              {$("#errorInternalInterface")}

        // Database
        firstDatabase                       { $("#dbInfo_1") }
        secondDatabase                      { $("#dbInfo_2") }

        buttonDatabase                      { $(id:"btnDatabaseLink") }
        buttonAddDatabase                   { $("#btnAddDatabase") }

        popupAddDatabase                    { $("#txtDbName") }
        popupAddDatabaseNameField           { $("#txtDbName") }
        popupAddDatabaseDeploymentField     { $("#txtDeployment") }
        popupAddDatabaseButtonOk            (required:false) { $("#btnAddDatabaseOk") }
        popupAddDatabaseButtonCancel        { $("#addDatabase > div > div > div.modal-footer > button.btn.btn-gray") }
        popupEditDatabaseButtonOk           { $("#btnAddDatabaseOk") }
        popupDeleteDatabaseButtonOk         { $("#btnDeleteDatabaseOk") }

        // Change Save Status
        saveStatus                          { $(id:"changeSaveStatus") }

        // MODULES - The elements of Cluster Configuration are separated into modules
        overview        { module OverviewModule }
        directories     { module DirectoriesModule }
        dr              { module DatabaseReplicationModule }
    }

    static at = {
//        waitFor(30) { clusterSettingsTab.isDisplayed() }
        //      waitFor(30) { serverSettingsTab.isDisplayed() }
    }

    /*
     *  Return the id of delete button of Server with index as input
     */
    String getIdOfDeleteButton(int index) {
        return ("deleteServer_" + String.valueOf(index))
    }

    /*
     *  Return the id of edit button of Server with index as input
     */
    String getIdOfEditButton(int index) {
        return ("editServer_" + String.valueOf(index))
    }

    /*
     *  Return the id of delete button for Database with index as input
     */
    String getIdOfDatabaseDeleteButton(String index) {
        return ("deleteDatabase_" + index)
    }

    /*
     *  Return the id of edit button for Database with index as input
     */
    String getIdOfDatabaseEditButton(String index) {
        return ("editDatabase_" + index)
    }
}