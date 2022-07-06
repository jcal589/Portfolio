using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain.Jobs;
using Sabio.Models.Requests.Jobs;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/jobsadmin")]
    [ApiController]
    public class JobAdminApiController : BaseApiController
    {
        private IJobAdminService _service = null;
        private IAuthenticationService<int> _authService = null;

        public JobAdminApiController(IJobAdminService service
                , ILogger<JobAdminApiController> logger
                , IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(JobAdminAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                IUserAuthData user = _authService.GetCurrentUser();

                int id = _service.Add(model, user.Id);

                ItemResponse<int> response = new ItemResponse<int>() { Item = id };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(JobAdminUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                _service.Update(model);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;

            BaseResponse response = null;

            try
            {
                _service.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpGet("users/{creatorId:int}")]
        public ActionResult<ItemsResponse<Paged<JobAdmin>>> SelectByCreatedBy(int creatorId, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<JobAdmin> paginated = _service.SelectByCreatedBy(creatorId, pageIndex, pageSize);

                if (paginated == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource Not Found");
                }
                else
                {
                    response = new ItemResponse<Paged<JobAdmin>> { Item = paginated };
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
    }
}
