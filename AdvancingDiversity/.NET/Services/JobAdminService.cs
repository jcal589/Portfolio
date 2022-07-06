using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Jobs;
using Sabio.Models.Domain.Location;
using Sabio.Models.Requests.Jobs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Services
{
    public class JobAdminService : IJobAdminService
    {
        IDataProvider _data = null;

        public JobAdminService(IDataProvider data)
        {
            _data = data;
        }

        public int Add(JobAdminAddRequest model, int userId)
        {
            int id = 0;

            string procName = "[dbo].[JobsAdmin_Insert]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col);
                col.AddWithValue("@CreatedBy", userId);

                SqlParameter idOut = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);
            }, returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;

                int.TryParse(oId.ToString(), out id);
            });

            return id;
        }
        public void Update(JobAdminUpdateRequest model)
        {
            string procName = "[dbo].[JobsAdmin_Update]";

            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", model.Id);
                AddCommonParams(model, col);
            }, returnParameters: null);
        }
        public void Delete(int id) //Delete does not delete record. Delete updates "IsActive" column to false to "delete" record. 
        {
            string procName = "[dbo].[JobsAdmin_Delete]";

            _data.ExecuteNonQuery(procName, delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
            });
        }
        public Paged<JobAdmin> SelectByCreatedBy(int creatorId, int pageIndex, int pageSize)
        {
            Paged<JobAdmin> pagedList = null;
            List<JobAdmin> jobAdminList = null;
            int totalCount = 0;

            string procName = "[dbo].[JobsAdmin_Select_ByCreatedBy]";
            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@CreatedById", creatorId);
                col.AddWithValue("@PageIndex", pageIndex);
                col.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                JobAdmin aJob = MapSingleJob(reader, ref startingIndex);
                totalCount = reader.GetSafeInt32(startingIndex);

                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }

                if (jobAdminList == null)
                {
                    jobAdminList = new List<JobAdmin>();
                }
                jobAdminList.Add(aJob);
            });
            if (jobAdminList != null)
            {
                pagedList = new Paged<JobAdmin>(jobAdminList, pageIndex, pageSize, totalCount);
            }
            return pagedList;
        }

        #region Private Classes
        private static void AddCommonParams(JobAdminAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@JobTypeId", model.JobTypeId);
            col.AddWithValue("@LocationId", model.LocationId);
            col.AddWithValue("@Title", model.Title);
            col.AddWithValue("@Description", model.Description);
            col.AddWithValue("@Requirements", model.Requirements);
            col.AddWithValue("@IsActive", model.IsActive);
            col.AddWithValue("@ContactName", model.ContactName);
            col.AddWithValue("@ContactPhone", model.ContactPhone);
            col.AddWithValue("@ContactEmail", model.ContactEmail);

        }

        private static JobAdmin MapSingleJob(IDataReader reader, ref int startingIndex)
        {
            JobAdmin aJob = new JobAdmin();
            aJob.JobType = new LookUp();
            aJob.Location = new LocationData();

            aJob.Id = reader.GetSafeInt32(startingIndex++);

            aJob.JobType.Id = reader.GetSafeInt32(startingIndex++);
            aJob.JobType.Name = reader.GetSafeString(startingIndex++);

            aJob.Location.Id = reader.GetSafeInt32(startingIndex++);
            aJob.Location.LineOne = reader.GetSafeString(startingIndex++);
            aJob.Location.LineTwo = reader.GetSafeString(startingIndex++);
            aJob.Location.City = reader.GetSafeString(startingIndex++);
            aJob.Location.Zip = reader.GetSafeString(startingIndex++);

            aJob.CreatedBy = reader.GetSafeInt32(startingIndex++);
            aJob.Title = reader.GetSafeString(startingIndex++);
            aJob.Description = reader.GetSafeString(startingIndex++);
            aJob.Requirements = reader.GetSafeString(startingIndex++);
            aJob.IsActive = reader.GetSafeBool(startingIndex++);
            aJob.ContactName = reader.GetSafeString(startingIndex++);
            aJob.ContactPhone = reader.GetSafeString(startingIndex++);
            aJob.ContactEmail = reader.GetSafeString(startingIndex++);
            aJob.DateCreated = reader.GetSafeDateTime(startingIndex++);
            aJob.DateModified = reader.GetSafeDateTime(startingIndex++);

            return aJob;
        }

        #endregion
    }
}
