/**
 * Copyright (C) 2005-2017 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This mixin bring in the Alfresco JS API for other services to build upon.
 *
 * To use the JS API inside other services, just mix in this module and then use this.alfrescoJsApi
 *
 * @module alfresco/services/_JSAPIService
 * @author David Webster
 */
define(["dojo/_base/declare",
        "service/constants/Default",
        "alfresco-js-api"],
   function (declare, AlfConstants, AlfrescoApi) {

      return declare(null, {

         /**
          * local var for the JS API instance
          *
          * @instance
          */
         alfrescoJsApi: null,

         /**
          *
          * @instance
          * @override
          */
         initService: function alfresco_services_JSAPIService__initService() {
            this.inherited(arguments);
            this.initAPI();
         },

         /**
          * Initialise the Alfresco API.
          *
          * @instance
          */
         initAPI: function alfresco_services_JSAPIService__initAPI() {
            // Remove leading slash from URL Context as JS API adds one between hostEcm and contextRoot
            var shareContextRoot = AlfConstants.URL_CONTEXT.slice(1);
            this.alfrescoJsApi = new AlfrescoApi({
               provider: "ECM",
               hostEcm: window.location.protocol + "//" + window.location.host,
               // FIXME: JS API code adds /api between this and "-default-" in the API URL.
               contextRoot: shareContextRoot + "proxy/alfresco-api"
            });
         }
      });
   });
