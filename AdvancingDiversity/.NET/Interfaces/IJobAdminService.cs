using Sabio.Models;
using Sabio.Models.Domain.Jobs;
using Sabio.Models.Requests.Jobs;

namespace Sabio.Services
{
    public interface IJobAdminService
    {
        int Add(JobAdminAddRequest model, int userId);
        public void Update(JobAdminUpdateRequest model);
        public void Delete(int id);
        public Paged<JobAdmin> SelectByCreatedBy(int creatorId, int pageIndex, int pageSize);
    }
}
