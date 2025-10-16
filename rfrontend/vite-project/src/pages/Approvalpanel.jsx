import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ApprovalPanel = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [role, setRole] = useState("hod"); // can be 'hod', 'store', or 'gm'

  // ✅ Fetch all requisitions
  const fetchRequisitions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/requisitions");
      setRequisitions(res.data);
    } catch (err) {
      console.error("❌ Error fetching requisitions:", err.message);
    }
  };

  // ✅ Update status for selected requisition
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/requisitions/${id}/status`,
        { role, status: newStatus }
      );

      // ✅ Update the state instantly with new data
      const updatedReq = res.data.requisition;
      setRequisitions((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
      );

      alert("✅ Status updated successfully!");
    } catch (err) {
      console.error("❌ Error updating status:", err.message);
      alert("Error updating status ❌");
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  return (
    <div className="container mt-4 mb-5">
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">Approval Panel</h3>

        <div>
          <label className="me-2 fw-semibold">Role:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="hod">HOD</option>
            <option value="store">Store</option>
            <option value="gm">GM</option>
          </select>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle shadow-sm">
          <thead className="table-secondary text-center">
            <tr>
              <th>Req No</th>
              <th>Department</th>
              <th>Date</th>
              <th>Created By</th>
              <th>Remark</th>
              <th>HOD Status</th>
              <th>Store Status</th>
              <th>GM Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.length > 0 ? (
              requisitions.map((req) => (
                <tr key={req._id}>
                  <td className="text-center fw-semibold">{req.reqNo}</td>
                  <td>{req.department}</td>
                  <td>
                    {new Date(req.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>{req.createdBy}</td>
                  <td>{req.remark || "-"}</td>

                  {/* ✅ Display status (default to Pending if undefined) */}
                  <td className="text-center">
                    {req.status?.hod || "Pending"}
                  </td>
                  <td className="text-center">
                    {req.status?.store || "Pending"}
                  </td>
                  <td className="text-center">
                    {req.status?.gm || "Pending"}
                  </td>

                  {/* ✅ Action dropdown */}
                  <td className="text-center">
                    <select
                      className="form-select"
                      onChange={(e) => updateStatus(req._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Update Status
                      </option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted py-3">
                  No requisitions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalPanel;
