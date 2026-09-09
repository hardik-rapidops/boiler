// CommonJS package manager support

(function (window, angular, undefined) {
    'use strict';

    var module = angular.module("harsco-pk");

    module.factory(
        "$toast", ['$mdToast',function ($mdToast) {

            function extend(option) {
                return angular.extend({}, src);
            }

            function show(message,type) {
                // TODO - receive options from each control, may be in future we need different toast behaviours

                var theme = "success-toast";
                if(type == 2) theme = "error-toast";

                $mdToast.show(
                    $mdToast.simple()
                        .position('top')
                        .textContent(message)
                        .hideDelay(3000)
                        .theme(theme)
                );
            }

            function hide() {
                $mdToast.hide();
            }

            var messages = {
                USERNAME_EMAIL_REQUIRED : "Email is required",
                PASSWORD_REQUIRED : "Password is required",
                USER_NOT_FOUND : "Coudn't find your account",
                PASSWORD_NOT_MATCH : "Wrong password. Try again or click Forgot password to reset it",
                LOGIN_FAILED : "Login failed. Please verify email & password and try again.",
                LOGIN_FAILED_EMAIL_NOT_VERIFIED: "Email not verified. Please check your email and click the link to verify.",
                SAVE_USER_SUCCESS: "Your profile is updated.",
                SAVE_USER_FAILED: "Sorry, unable to update your profile.",
                REGISTER_SUCCESS    :   "Your account is created. Please login to continue.",
                REGISTER_FAILED     :   "Sorry, please try again",
                ADD_SITES_BEFORE_BOILER: "You do not have sites, please add a site first.",
                USER_GET_FAILED     :   "Unable to get your details, please try again.",
                EMAIL_VERIFY_SUCCESS: "Email Verified. Please login to access your account.",
                EMAIL_VERIFY_FAILED: "Email verification failed. Please create an account.",
                FORGOT_PASSWORD_SUCCESS: "An email is sent with instructions. Please check your email to continue.",
                FORGOT_PASSWORD_FAILED: "Unable to request new password. Please try again later.",
                USER_INVITE_SUCCESS: "An email is sent with instructions. Please check your email to continue.",
                USER_INVITE_FAILED: "Unable to resend invitation. Please try again later.",
                RESET_PASSWORD_SUCCESS: "Your password is updated. Please login to access your account.",
                RESET_PASSWORD_FAILED: "Unable to update your password. Please try again later.",
                INVALID_BOILER_CODE: "The boiler code you have entered is invalid. Please verify and try again.",
                BOILER_INFO_ADD_SUCCESS: "Boiler added to your account.",
                BOILER_INFO_UPDATE_SUCCESS: "Boiler Info has been updated.",
                BOILER_INFO_ADD_FAIL: "Unable to add boiler. Please try again later.",
                CHANGE_PASSWORD_SUCCESS: "Email is sent with link to reset your password. Please check your email to continue.",
                SAVE_SITE_SUCCESS: "Site is added.",
                UPDATE_SITE_SUCCESS: "Site is Updated.",
                SAVE_SITE_SUCCESS_REDIRECT: "Site is added, redirecting to add Boiler.",
                SAVE_SITE_FAILURE: "Unable to add Site at this time. Please try again later.",
                SAVE_BOILER_SUCCESS: "Boiler info id updated.",
                SAVE_BOILER_FAILURE: "Unable to add Boiler at this time. Please try again later.",
                INTERNET_FAILURE: "There is no network, which is required to fetch latest information. Please try again later.",
                DELETE_SITE_SUCCESS: "Site is deleted.",
                DELETE_SITE_FAILURE: "Unable to delete the site at this time. Please try again later.",
                DELETE_NOTIFICATIONS_SUCCESS: "Device(s) deleted.",
                DELETE_NOTIFICATIONS_FAIL: "Unable to delete. Please try again later.",
                BOILER_WRITE_SUCCESS: "Update values sent to Boiler.",
                BOILER_WRITE_FAILED: "Unable to update Boiler info. Please try again later.",
                FILE_SUCCESS: "File download request sent to the boiler.",
                FILE_ERROR: "Unable to request file download at this time. Please try again later.",
                INVALID_FILETYPE_UPLOAD: "Please upload a valid CSV file.",
                FILE_UPLOADED_SUCCESS: "File Uploaded.",
                INVALID_CSV_DATA: "Invalid CSV file content. Please check and try again.",
                INVITATION_SUCCESS: "User Invitation sent.",
                INVITATION_FAIL: "Unable to Invite User at this time. Please try again later.",
                INVALID_IMAGE_SELECTION: "Atleast choose one image.",
                FILE_REMOVED_SUCCESS: "Boiler Image(s) removed.",
                INVALID_IMAGE_UPLOAD: "Choose an image file to upload.",
                NO_NOTIFICATIONS_SELECT: "Please select any one of the device",
                DELETE_USER_SUCCESS:"User(s) removed.",
                DELETE_USER_FAILURE:"Unable to delete the user at this time. Please try again later.",
                UPDATE_USER_FAILURE:"Unable to update the user at this time. Please try again later.",
                FILE_UPLOAD_CHOOSEN:"File to be uploaded has been chosen",
                INVALID_SEARCH_STRING: "Please select any valid zip",
                INVALID_USER_SELECTION: "Atleast choose one user.",
                INVALID_USER_DELETE: " Unable to Remove, Login with this user.",
                BOILER_ALERTS_UPDATE_SUCCESS: "Boiler Alerts have been updated.",
                BOILER_ALERTS_TEMP_ERROR: "Alert for this temperature already exists. Choose other one.",
                BOILER_UNLINK_SUCCESS: "Boiler is removed from the site.",
                BOILER_UNLINK_FAIL: "Unable to remove boiler. Please try later.",
                BOILER_REPLACE_SUCCESS:"Boiler is replaced successfully.",
                BOILER_REPLACE_FAIL:"Unable to replace boiler",
                BOILER_LOAD_FAILED:"Unable to load boiler details.",
                BOILER_DETAILS_FAILED:"Timeout while loading boiler records.",
                EMAIL_NOTIFICATIONS_SUCCESS : "Updated notifications for email.",
                EMAIL_NOTIFICATIONS_FAIL : "Unable to update notifications for email.",
                INVALID_IMAGE_FORMAT: "Choose valid image file to upload.",
                DEVICE_NOTIFICATIONS_SUCCESS: "Updated notifications for device",
                DEVICE_NOTIFICATIONS_FAIL : "Unable to update notifications for device.",
                INVALID_FILE: "Invalid file format!"
            };

            var types = {
                SUCCESS : 1,
                ERROR : 2
            };

            var toast = {};
            toast.messages = messages;
            toast.show = show;
            toast.hide = hide;
            toast.types = types;

            return toast;
        }]
    );

})(window, window.angular);
