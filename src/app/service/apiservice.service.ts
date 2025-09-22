import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiserviceService {
  baseurl = environment.live_url;
  newUrl = environment.live_url;
  org_id: any;
  accessArr: any = [];
  token: any;
  headers: any;
  constructor(private http: HttpClient, private toastr: ToastrService) {}
  ngOnInit() {
    this.token = sessionStorage.getItem('token');
    this.org_id = sessionStorage.getItem('org_id');
    // this.headers = {'Authorization':this.token}
  }

  private isComponentLoadedSubject = new BehaviorSubject<boolean>(false);
  isComponentLoaded$ = this.isComponentLoadedSubject.asObservable();
  setComponentLoadedStatus(status: boolean) {
    this.isComponentLoadedSubject.next(status);
  }

  private subModulesSubject = new BehaviorSubject<any[]>([]);
  subModules$ = this.subModulesSubject.asObservable();
  setSubModules(array) {
    this.subModulesSubject.next(array);
  }
  // Success Message
  showSuccess(message: any) {
    this.toastr.success(message);
  }
  // Error Message
  showError(message: any) {
    this.toastr.error(message);
  }
  // Warning Message
  showWarning(message: any) {
    this.toastr.warning(message);
  }
  // Login
  // loginDetails(data: any) {
  //   return this.http.post(`${this.baseurl}/login`, data)
  // }
  loginDetails(data: any) {
    return this.http.post(`${this.baseurl}/login/`, data);
  }
  userAccess(user_id: any) {
    return this.http.get(`${this.baseurl}/user-access/${user_id}/`);
  }
  // Login
  //Register
  register(data: any) {
    return this.http.post(`${this.baseurl}/register`, data);
  }
  //Register
  // Forgot Password
  ForgotPasswordDetails(data: any) {
    return this.http.post(`${this.baseurl}/forgot-password/`, data);
  }
  // Forgot Password
  // Otp
  otp(data: any) {
    return this.http.post(`${this.baseurl}/verify-otp/`, data);
  }
  // Otp
  // Reset Forgot Password
  resetPassword(data: any) {
    return this.http.post(`${this.baseurl}/password-reset`, data);
  }
  // Reset Forgot Password

  // dashboard
  getCount(data, token) {
    return this.http.post(`${this.baseurl}/dash-board`, data);
  }
  // dashboard

  // ORG--Roles
  addRoleDetails(data: any) {
    return this.http.post(`${this.baseurl}/organization-roles`, data);
  }

  getRoleDetailsPage(params) {
    return this.http.get(`${this.baseurl}/organization-roles?${params}`);
  }

  deleteRoleDetails(id: any) {
    return this.http.delete(`${this.baseurl}/organization-roles/${id}`);
  }
  getCurrentRoleDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/organization-roles?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}`
    );
  }
  updateRole(id: any, data: any) {
    return this.http.put(`${this.baseurl}/organization-roles/${id}`, data);
  }
  // Roles
  // Department
  addDepartmentDetails(data: any) {
    return this.http.post(`${this.baseurl}/organization-department`, data);
  }
  getDepartmentDetails(params, org) {
    return this.http.get(
      `${this.baseurl}/organization-department?page_number=1&data_per_page=2&pagination=${params.pagination}&org_ref_id=${org}`
    );
  }
  getDepartmentDetailsPage(params) {
    return this.http.get(`${this.baseurl}/organization-department?${params}`);
  }
  deleteDepartmentDetails(id: any) {
    return this.http.delete(`${this.baseurl}/organization-department/${id}`);
  }
  getCurrentDepartmentDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/organization-department?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&org_ref_id=${params.org_ref_id}&pagination=FALSE`
    );
  }
  updateDepartmant(id: any, data: any) {
    return this.http.put(`${this.baseurl}/organization-department/${id}`, data);
  }
  // Department

  // new department api
  postDepartmentList(data: any) {
    return this.http.post(`${this.baseurl}/department/`, data);
  }
  getDepartmentList(params) {
    return this.http.get(`${this.baseurl}/department/${params}`);
  }
  getByIdDepartmentList(id) {
    return this.http.get(`${this.baseurl}/department/${id}/`);
  }
  putDepartmentList(id, data) {
    return this.http.put(`${this.baseurl}/department/${id}/`, data);
  }
  deleteDepartmentList(id) {
    return this.http.delete(`${this.baseurl}/department/${id}/`);
  }
  // new department api end

  // Industry Sector
  addIndustryDetails(data: any) {
    return this.http.post(`${this.baseurl}/type-of-industries`, data);
  }
  getIndustryDetails(params) {
    return this.http.get(
      `${this.baseurl}/type-of-industries?page_number=1&data_per_page=2&pagination=${params.pagination}&org_ref_id=${params.org_ref_id}`
    );
  }
  getIndustryDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/type-of-industries?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&org_ref_id=${params.org_ref_id}&pagination=${params.pagination}`
    );
  }
  deleteIndustryDetails(id: any) {
    return this.http.delete(`${this.baseurl}/type-of-industries/${id}`);
  }
  getCurrentIndustryDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/type-of-industries?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&org_ref_id=${params.org_ref_id}`
    );
  }
  updateIndustry(id: any, data: any) {
    return this.http.put(`${this.baseurl}/type-of-industries/${id}`, data);
  }
  // Industry Sector

  // Client

  // addClientDetails(data: any) {
  //   return this.http.post(`${this.baseurl}/clients`, data)
  // }

  getClientDetails(params, org) {
    return this.http.get(
      `${this.baseurl}/clients?page_number=1&data_per_page=2&pagination=${params.pagination}&org_ref_id=${org}`
    );
  }
  getClientDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/clients?page_number=${params.page_number}&data_per_page=${params.data_per_page}`
    );
  }
  deleteClientDetails(id: any) {
    return this.http.delete(`${this.baseurl}/clients/${id}`);
  }
  getCurrentClientDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/clients?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=TRUE&org_ref_id=${params.org_ref_id}`
    );
  }
  updateClient(id: any, data: any) {
    return this.http.put(`${this.baseurl}/clients/${id}`, data);
  }

  // ================= new pi for client
  addClientDetails(data: any) {
    return this.http.post(`${this.baseurl}/client/`, data);
  }
  getClientListFromUserId(params) {
    return this.http.get(`${this.baseurl}/client/${params}`);
  }
  deleteClient(id: any) {
    return this.http.delete(`${this.baseurl}/client/${id}/`);
  }
  getCurrentClient(id: any) {
    return this.http.get(`${this.baseurl}/client/${id}/`);
  }
  updateClientList(id: any, data: any) {
    return this.http.put(`${this.baseurl}/client/${id}/`, data);
  }
  // =================== Client

  // Project- Status
  // Sub Category
  addSubCategoryDetails(data: any) {
    return this.http.post(`${this.baseurl}/project-status-sub-category`, data);
  }
  getSubCategoryDetails(params) {
    return this.http.get(
      `${this.baseurl}/project-status-sub-category?page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  getSubCategoryDetailsPage(params) {
    return this.http
      .get(`${this.baseurl}/project-status-sub-category?page_number=${params.page_number}&data_per_page=${params.data_per_page}
    `);
  }
  deleteSubCategoryDetails(id: any) {
    return this.http.delete(
      `${this.baseurl}/project-status-sub-category/${id}`
    );
  }
  getCurrentSubCategoryDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/project-status-sub-category?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}`
    );
  }
  updateSubCategory(id: any, data: any) {
    return this.http.put(
      `${this.baseurl}/project-status-sub-category/${id}`,
      data
    );
  }
  // Sub Category
  // Main Category
  addMainCategoryDetails(data: any) {
    return this.http.post(`${this.baseurl}/project-status-main-category`, data);
  }
  getMainCategoryDetails(params) {
    return this.http.get(
      `${this.baseurl}/project-status-main-category?page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  getMainCategoryDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/project-status-main-category?page_number=${params.page_number}&data_per_page=${params.data_per_page}`
    );
  }
  deleteMainCategoryDetails(id: any) {
    return this.http.delete(
      `${this.baseurl}/project-status-main-category/${id}`
    );
  }
  getCurrentMainCategoryDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/project-status-main-category?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}`
    );
  }
  updateMainCategory(id: any, data: any) {
    return this.http.put(
      `${this.baseurl}/project-status-main-category/${id}`,
      data
    );
  }
  // Main Category
  // Project- Status

  // Project
  addProjectDetails(data: any) {
    return this.http.post(`${this.baseurl}/project/`, data);
  }
  getProjectDetails(params) {
    return this.http.get(`${this.baseurl}/project/?${params}`);
  }
  getProjectDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/projects?user_id=${params.user_id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=TRUE&organization_id=${params.organization_id}`
    );
  }
  getProjectDetailsByClientId(id: any) {
    return this.http.get(`${this.baseurl}/projectbyclients/?client_id=${id}`);
  }
  deleteProjectDetails(params: any) {
    return this.http.delete(`${this.baseurl}/project/${params}/`);
  }
  deleteTaskInProjectData(id: any) {
    return this.http.delete(`${this.baseurl}/project-task/${id}/`);
  }
  getCurrentProjectDetails(id: any) {
    return this.http.get(`${this.baseurl}/project/${id}/`);
  }
  updateProject(id: any, data: any) {
    return this.http.put(`${this.baseurl}/project/${id}/`, data);
  }

  postProjectTask(data) {
    return this.http.post(`${this.baseurl}/project-task/`, data);
  }
  putProjectTask(id, data) {
    return this.http.put(`${this.baseurl}/project-task/${id}/`, data);
  }
  // Project

  //reporting/Aprrover manager
  getManagerDetails(params, orgId) {
    //return this.http.get(`${this.baseurl}/profile-custom-user?page_number=1&data_per_page=2&pagination=${params.pagination}`,{headers:this.headers})
    return this.http.get(
      `${this.baseurl}/profile-custom-user?page_number=1&data_per_page=2&pagination=${params.pagination}&organization_id=${orgId}`
    );
  }
  //reporting/Aprrover manager

  //People group
  getPeopleGroupDetails() {
    return this.http.get(
      `${this.baseurl}/org-people-group?page_number=1&data_per_page=2&pagination=FALSE`
    );
  }
  //People group

  // Leave/Holiday List
  addLeaveDetails(data: any) {
    return this.http.post(`${this.baseurl}/leave-application`, data);
  }
  getLeaveDetails() {
    return this.http.get(`${this.baseurl}/leave-application`);
  }
  deleteLeaveDetails(id: any) {
    return this.http.delete(`${this.baseurl}/leave-application/${id}`);
  }
  // Leave/Holiday List

  //time Sheet master
  addTimeSheetDetails(data: any) {
    return this.http.post(`${this.baseurl}/time-sheet`, data);
  }
  getTimeSheetDetails() {
    return this.http.get(`${this.baseurl}/time-sheet`);
  }
  deleteTimeSheeteDetails(id: any, params) {
    return this.http.delete(
      `${this.baseurl}/time-sheets/${id}?module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}`
    );
  }
  //time Sheet master

  //Leave Details
  addLeaveTypeDetails(data: any) {
    return this.http.post(`${this.baseurl}/master-leave-types`, data);
  }
  getLeaveDetail(params) {
    return this.http.get(
      `${this.baseurl}/master-leave-types?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=TRUE&organization_id=${params.organization_id}`
    );
  }
  getLeaveTypeDetails(params) {
    return this.http.get(
      `${this.baseurl}/master-leave-types?page_number=1&data_per_page=2&pagination=FALSE&organization_id=${params.orgId}&center_id=${params.center_id}`
    );
  }
  deleteLeaveTypeDetails(id: any) {
    return this.http.delete(
      `${this.baseurl}/master-leave-types/${id}?page_number=1&data_per_page=2&pagination=FALSE`
    );
  }
  getCurrentLeaveTypeDetails(id: any, org: any) {
    return this.http.get(
      `${this.baseurl}/master-leave-types?id=${id}&page_number=1&data_per_page=2&pagination=FALSE&organization_id=${org}`
    );
  }
  updateLeaveTypeCategory(id: any, data: any) {
    return this.http.put(`${this.baseurl}/master-leave-types/${id}`, data);
  }
  //Leave Details

  // Project Task Category
  addProjectTaskCategoryDetails(data: any) {
    return this.http.post(`${this.baseurl}/task-project-categories`, data);
  }
  getProjectTaskCategoryDetails(params) {
    return this.http.get(
      `${this.baseurl}/task-project-categories?page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  getProjectTaskCategoryDetailsByProjectId(id: any) {
    return this.http.get(`${this.baseurl}/taskbyprojects/?project_id=${id}`);
  }
  getTimeSpent() {
    return this.http.get(`${this.baseurl}/timespent/`);
  }
  getProjectTaskCategoryDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/task-project-categories?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&org_ref_id=${params.org_ref_id}&pagination=TRUE`
    );
  }
  getSubTaskByProjectTaskCategory(id: any, params) {
    return this.http.get(
      `${this.baseurl}/task-project-categories?id=${id}&page_number=1&data_per_page=10&pagination=FALSE&org_ref_id=${params}`
    );
  }
  deleteProjectTaskCategoryDetails(id: any) {
    return this.http.delete(`${this.baseurl}/task-project-categories/${id}`);
  }
  getCurrentProjectTaskCategoryDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/task-project-categories?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=TRUE&org_ref_id=${params.org_ref_id}`
    );
  }
  updateProjectTaskCategory(id: any, data: any) {
    return this.http.put(`${this.baseurl}/task-project-categories/${id}`, data);
  }

  // Project Task Category

  // new project category
  postProjCategory(data: any) {
    return this.http.post(`${this.baseurl}/project_category/`, data);
  }
  getProjCategory(param) {
    return this.http.get(`${this.baseurl}/project_category/?${param}`);
  }
  getProjCategoryById(id: any) {
    return this.http.get(`${this.baseurl}/project_category/${id}/`);
  }
  putProjCategory(id: any, data: any) {
    return this.http.put(`${this.baseurl}/project_category/${id}/`, data);
  }
  deleteProjCategory(id: any) {
    return this.http.delete(`${this.baseurl}/project_category/${id}/`);
  }
  // new project category ends here

  // Prefix/suffix
  addPrefixSuffixDetails(data: any) {
    return this.http.post(`${this.baseurl}/prefix-suffix`, data);
  }
  getPrefixSuffixDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/prefix-suffix?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&organization_id=${params.organization_id}&pagination=TRUE`
    );
  }
  getPrefixSuffixDetails(params, orgId) {
    return this.http.get(
      `${this.baseurl}/prefix-suffix?page_number=1&data_per_page=2&pagination=${params.pagination}&organization_id=${orgId}`
    );
  }
  deletePrefixSuffixDetails(id: any) {
    return this.http.delete(`${this.baseurl}/prefix-suffix/${id}`);
  }
  getCurrentPrefixSuffixDetails(id: any, params, org) {
    return this.http.get(
      `${this.baseurl}/prefix-suffix?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${org}`
    );
  }
  updatePrefixSuffix(id: any, data: any) {
    return this.http.put(`${this.baseurl}/prefix-suffix/${id}`, data);
  }
  // Prefix/suffix

  // Centre
  addCenterDetails(data: any) {
    return this.http.post(`${this.baseurl}/center`, data);
  }
  getCenterDetails(params, orgId) {
    return this.http.get(
      `${this.baseurl}/center?page_number=1&data_per_page=2&pagination=${params.pagination}&organization_id=${orgId}`
    );
  }
  getCenterDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/center?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${params.organization_id}`
    );
  }
  deleteCenterDetails(id: any) {
    return this.http.delete(`${this.baseurl}/center/${id}`);
  }
  getCurrentCentreDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/center?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${params.organization_id}`
    );
  }
  updateCentre(id: any, data: any) {
    return this.http.put(`${this.baseurl}/center/${id}`, data);
  }
  // Centre

  // people
  addPeopleDetails(data: any) {
    return this.http.post(`${this.baseurl}/people`, data);
  }
  getPeopleDetails(params) {
    return this.http.get(
      `${this.baseurl}/people?page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  getPeopleDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/people?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&organization_id=${params.organization_id}&pagination=TRUE`
    );
  }
  getSuperAdminPeoplePage(params) {
    return this.http.get(
      `${this.baseurl}/people?page_number=${params.page_number}&data_per_page=${params.data_per_page}&organization_id=${params.organization_id}&pagination=TRUE&ignore_super_admin=${params.ignore_super_admin}&search_key=${params.search_key}`
    );
  }

  deletePeopleDetails(id: any) {
    return this.http.delete(`${this.baseurl}/people/${id}`);
  }
  getCurrentPeopleDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/people?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&organization_id=${params.organization_id}&pagination=TRUE`
    );
  }
  updatePeople(id: any, data: any) {
    return this.http.put(`${this.baseurl}/people/${id}`, data);
  }
  // people

  // Tags
  addTagDetails(data: any) {
    return this.http.post(`${this.baseurl}/tag`, data);
  }
  getTagDetails(params, orgId) {
    return this.http.get(
      `${this.baseurl}/tag?page_number=1&data_per_page=10&pagination=${params.pagination}&organization_id=${orgId}`
    );
  }
  getTagDetailsPage(params) {
    return this.http.get(
      `${this.baseurl}/tag?search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${params.organization_id}`
    );
  }
  deleteTagDetails(id: any) {
    return this.http.delete(`${this.baseurl}/tag/${id}`);
  }
  getCurrentTagCategoryDetails(id: any, params) {
    return this.http.get(
      `${this.baseurl}/tag?id=${id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${params.organization_id}`
    );
  }
  updateTagCategory(id: any, data: any) {
    return this.http.put(`${this.baseurl}/tag/${id}`, data);
  }

  // Profile
  updateProfileDetails(id, data: any) {
    return this.http.put(`${this.baseurl}/profile-custom-user/${id}`, data);
  }
  // Profile

  // change password
  addChangePassword(data: any) {
    return this.http.post(`${this.baseurl}/change-password/`, data);
  }
  forgotPassword(data: any) {
    return this.http.post(`${this.baseurl}/set-new-password/`, data);
  }
  // change password

  //Cost center
  getCostCenterDetails(params) {
    return this.http.get(
      `${this.baseurl}/organization-cost-centers?page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  //Cost center

  //Subscription plan
  getSubscription() {
    return this.http.get(`${this.baseurl}/subscriptionplan`);
  }
  //My Leaves
  getMyLeaves(id, params) {
    return this.http.get(
      `${this.baseurl}/users-leave-details?user_id=${id}&page_number=1&data_per_page=2&pagination=${params.pagination}`
    );
  }
  getLeaveBalance(params, data) {
    return this.http.get(
      `${this.baseurl}/emp-balance-leave?user_id=${params.user_id}&days=${params.days}&leave_type_id=${params.leave_type_id}&from_date=${params.from_date}&to_data=${params.to_data}&from_session=${params.from_session}&to_session=${params.to_session}`,
      data
    );
  }
  getLeaveData(params, pagination) {
    return this.http.get(
      `${this.baseurl}/leave-application?approved_state=${params.approved_state}&user_id=${params.user_id}&leaveApplication_from_date=${params.leaveApplication_from_date}&leaveApplication_to_date=${params.leaveApplication_to_date}&page_number=${pagination.page_number}&data_per_page=${pagination.data_per_page}`
    );
  }
  getLeavePaginationNone() {
    return this.http.get(
      `${this.baseurl}/leave-application?approved_state=APPROVED&page_number=1&data_per_page=2&pagination=FALSE`
    );
  }
  getHolidayList(params) {
    return this.http.get(
      `${this.baseurl}/holidays?date=${params.date}&country=${params.country}&state=${params.state}`
    );
  }

  deletePeopleLeaves(id, params) {
    return this.http.delete(
      `${this.baseurl}/leave-application/${id}?module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}`
    );
  }
  //Leave Application State Change
  leaveApplicationState(data: any) {
    return this.http.post(
      `${this.baseurl}/leave-application-state-change`,
      data
    );
  }
  //addTimeSheet
  addTimeSheet(data: any) {
    return this.http.post(`${this.baseurl}/time-sheets`, data);
  }
  // USER ROlES
  userAccessConfig(id, data) {
    return this.http.put(`${this.baseurl}/user-role/${id}`, data);
  }
  getUserAccess(params) {
    return this.http.get(`${this.baseurl}/user-role?${params}`);
  }
  addRoles(data, params) {
    return this.http.post(`${this.baseurl}/user-role`, data);
  }

  getUserRoleById(id) {
    return this.http.get(`${this.baseurl}/user-role?${id}`);
  }

  // new designation names
  postDesignationList(data: any) {
    return this.http.post(`${this.baseurl}/designation/`, data);
  }
  getDesignationList(params) {
    return this.http.get(`${this.baseurl}/designation/${params}`);
  }
  getDesignationListById(id: any) {
    return this.http.get(`${this.baseurl}/designation/${id}/`);
  }
  putDesignationList(id: any, data: any) {
    return this.http.put(`${this.baseurl}/designation/${id}/`, data);
  }
  deleteDesignationList(id: any) {
    return this.http.delete(`${this.baseurl}/designation/${id}/`);
  }
  // new designation names end here

  getData(params) {
    return this.http.get(params);
  }

  // new profile url
  getProfileDetails(params) {
    return this.http.get(`${this.baseurl}/user/${params}`);
  }
  updateUserProfileDetails(user_id: any, data: any) {
    return this.http.put(`${this.baseurl}/user/${user_id}/`, data);
  }
  // profile ends here
  getDataWithHeaders(params) {
    return this.http.get(params);
  }
  postData(url, data: any) {
    return this.http.post(url, data);
  }
  updateData(url, data) {
    return this.http.put(url, data);
  }
  delete(id) {
    return this.http.delete(id);
  }

  // gender api
  getAllGenders() {
    return this.http.get(`${this.baseurl}/gender/`);
  }
  // marital status
  getAllMaritalStatus() {
    return this.http.get(`${this.baseurl}/marital-status/`);
  }
  // project status
  getProjectStatus() {
    return this.http.get(`${this.baseurl}/project_status/`);
  }

  // roles list
  getAllRoles() {
    return this.http.get(`${this.baseurl}/role/`);
  }
  // Creating Employees
  postEmployee(data) {
    return this.http.post(`${this.baseurl}/user/`, data);
  }
  getEmployeeList(params) {
    return this.http.get(`${this.baseurl}/all-employee/${params}`);
  }
  getEmployeeDetailsById(params) {
    return this.http.get(`${this.baseurl}/employee/${params}`);
  }
  postOrganizationDataOfEmployee(data, id) {
    return this.http.post(`${this.baseurl}/employee/${id}/`, data);
  }
  putOrganizationDataOfEmployee(data, id) {
    return this.http.put(`${this.baseurl}/employee/${id}/`, data);
  }
  deleteEmployees(id: any) {
    return this.http.delete(`${this.baseurl}/user/${id}/`);
  }

  deleteMultiple(url, data) {
    return this.http.delete(url, data);
  }

  // new roles and access
  getAccessByDesignationId(param) {
    return this.http.get(`${this.baseurl}/designation-access/${param}`);
  }
  postAccessToDesignation(data: any) {
    return this.http.post(`${this.baseurl}/designation-access/`, data);
  }
  putAccessToDesignation(id: any, data: any) {
    return this.http.put(`${this.baseurl}/designation-access/${id}/`, data);
  }

  emailVerificationForSelfRegistration(data) {
    return this.http.post(`${this.baseurl}/send-mail-for-verification/`, data);
  }

  postdesignationRoleAccess(data: any) {
    return this.http.post(`${this.baseurl}/designation-access/`, data);
  }

  putdesignationRoleAccess(data: any, id: any) {
    return this.http.put(`${this.baseurl}/designation-access/${id}/`, data);
  }

  // get order id from razorpay
  getRazorpayFromData(data: any) {
    return this.http.post(`${this.baseurl}/get-razor-pay-order/`, data);
  }
  postStandardPlan(data) {
    return this.http.post(`${this.baseurl}/buy-subscription/`, data);
  }
  addUsersForExistingPlan(data) {
    return this.http.post(
      `${this.baseurl}/add-users-to-existing-subscription/`,
      data
    );
  }

  getEmployeeLeaves(employee_id: any, leave_type?: any) {
    let url = `${this.baseurl}/employee_leaves/?employee=${employee_id}`;

    if (leave_type) {
      url += `&leave-type=${leave_type}`;
    }

    return this.http.get(url);
  }

  getLeaveTypeById(id: any) {
    return this.http.get(`${this.baseurl}/leave_type/${id}/`);
  }

  getUpcomingHolidays() {
    return this.http.get(`${this.baseurl}/holiday_calendar/?is-upcoming=True`);
  }
  getAlEmployeesUnderManager(manager_id: any) {
    return this.http.get(
      `${this.baseurl}/?page=1&page_size=10&is_active=True&employee=True&reporting_manager_id=${manager_id}`
    );
  }

  getAllEmployees2() {
    return this.http.get(`${this.baseurl}/all-employees/`);
  }

  getUserById(id: any) {
    return this.http.get(`${this.baseurl}/user/${id}/`);
  }
}
