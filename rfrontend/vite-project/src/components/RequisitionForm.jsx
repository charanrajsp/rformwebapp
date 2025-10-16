import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";


const RequisitionForm = () => {
  const [reqNo, setReqNo] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const [formData, setFormData] = useState({
    type: "Revenue",
    department: "",
    departmentId: "",
    date: "",
    remark: "",
    createdBy: "Admin",
    status: {
      hod: "Pending",
      store: "Pending",
      gm: "Pending",
    },
  });

  const [items, setItems] = useState([
    {
      srNo: 1,
      itemCode: "",
      itemDescription: "",
      subGroup: "",
      extraDescription: "",
      make: "",
      currentStock: 0,
      requiredQty: 0,
      uom: "",
    },
  ]);

  // --- Fetch departments ---
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("❌ Error fetching departments:", err.message);
    }
  };

  // --- Fetch items for department ---
  const fetchItemsForDepartment = async (departmentId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/items/${departmentId}`
      );
      setItemsList(res.data);
    } catch (err) {
      console.error("❌ Error fetching items:", err.message);
      setItemsList([]);
    }
  };

  // --- Fetch approval status by ReqNo ---
  const fetchApprovalStatus = async (reqNo) => {
  if (!reqNo) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/requisitions/byReqNo/${reqNo}`
    );

    if (res.data) {
      setFormData((prev) => ({
        ...prev,
        status: {
          hod: res.data.hodStatus || "Pending",
          store: res.data.storeStatus || "Pending",
          gm: res.data.gmStatus || "Pending",
        },
      }));
    }
  } catch (err) {
    console.error("❌ Error fetching approval status:", err.message);
  }
};

  // --- Department select ---
  const selectDepartment = (dept) => {
    setFormData({
      ...formData,
      department: dept.name,
      departmentId: dept._id,
    });
    setShowDeptDropdown(false);
    fetchItemsForDepartment(dept._id);
  };

  // --- Item select ---
  const selectItem = (index, selectedItem) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      itemCode: selectedItem.itemCode || "",
      itemDescription: selectedItem.description || "",
      subGroup: selectedItem.subGroup || "",
      extraDescription: selectedItem.extraDescription || "",
      make: selectedItem.make || "",
      currentStock: selectedItem.currentStock || 0,
      requiredQty: newItems[index].requiredQty || 0,
      uom: selectedItem.uom || "",
    };
    setItems(newItems);
    setShowItemDropdown(null);
  };

  // --- Handle changes ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  // --- Add item row ---
  const addRow = () => {
    setItems([
      ...items,
      {
        srNo: items.length + 1,
        itemCode: "",
        itemDescription: "",
        subGroup: "",
        extraDescription: "",
        make: "",
        currentStock: 0,
        requiredQty: 0,
        uom: "",
      },
    ]);
  };

  // --- Submit requisition ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      alert("⚠️ Please select a department first!");
      return;
    }

    const updatedItems = items.map((item) => ({
      ...item,
      department: formData.departmentId,
    }));

    const payload = {
      reqNo: `REQ${reqNo.toString().padStart(3, "0")}`,
      type: formData.type,
      department: formData.department,
      departmentId: formData.departmentId,
      date: formData.date,
      remark: formData.remark,
      createdBy: formData.createdBy,
      items: updatedItems,
    };

    try {
      await axios.post("http://localhost:5000/api/requisitions", payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Requisition submitted successfully!");

      // Reset form
      setFormData({
        type: "Revenue",
        department: "",
        departmentId: "",
        date: "",
        remark: "",
        createdBy: "Admin",
        status: {
          hod: "Pending",
          store: "Pending",
          gm: "Pending",
        },
      });
      setItems([
        {
          srNo: 1,
          itemCode: "",
          itemDescription: "",
          subGroup: "",
          extraDescription: "",
          make: "",
          currentStock: 0,
          requiredQty: 0,
          uom: "",
        },
      ]);
      setReqNo((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Axios error:", err.response?.data || err.message);
      alert("Error submitting requisition ❌");
    }
  };

  // --- Poll approval status every 5 sec ---
  useEffect(() => {
  const interval = setInterval(() => {
    const reqNoValue = `REQ${reqNo.toString().padStart(3, "0")}`;
    fetchApprovalStatus(reqNoValue);
  }, 5000);

  return () => clearInterval(interval);
}, [reqNo]);

  // --- Fetch departments on mount ---
  useEffect(() => {
    fetchDepartments();
    setReqNo(1);
  }, []);

  // --- Status color helper ---
  const getStatusClass = (status) => {
    if (status === "Approved") return "text-success";
    if (status === "Rejected") return "text-danger";
    return "text-secondary";
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-lg p-4 rounded-4">
        <h3 className="text-center text-primary mb-4 fw-bold">
          Purchase Requisition Form
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Header Info */}
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Purchase Req No</label>
              <input
                type="text"
                className="form-control"
                value={`REQ${reqNo.toString().padStart(3, "0")}`}
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Type</label>
              <select
                className="form-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option>Revenue</option>
                <option>Capital</option>
              </select>
            </div>

            <div className="col-md-3 position-relative">
              <label className="form-label fw-semibold">Department</label>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control"
                  name="department"
                  value={formData.department}
                  placeholder="Select Department"
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                >
                  <FaSearch />
                </button>
              </div>

              {showDeptDropdown && (
                <ul
                  className="list-group position-absolute w-100 mt-1 shadow-sm"
                  style={{ zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
                >
                  {departments.map((dept) => (
                    <li
                      key={dept._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => selectDepartment(dept)}
                      style={{ cursor: "pointer" }}
                    >
                      {dept.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
  {items.map((item, index) => (
    <div key={index} className="card mb-3 d-block d-md-none">
      <div className="card-body">
        <p><strong>Sr No:</strong> {item.srNo}</p>
        <p><strong>Item Code:</strong> 
          <input
            type="text"
            className="form-control"
            name="itemCode"
            value={item.itemCode}
            onFocus={() => setShowItemDropdown(index)}
            readOnly
          />
          {showItemDropdown === index && (
            <ul
              className="list-group mt-1 shadow-sm"
              style={{ maxHeight: "200px", overflowY: "auto", zIndex: 10 }}
            >
              {itemsList.length > 0 ? (
                itemsList.map((itm) => (
                  <li
                    key={itm._id}
                    className="list-group-item list-group-item-action"
                    onClick={() => selectItem(index, itm)}
                    style={{ cursor: "pointer" }}
                  >
                    {itm.itemCode} - {itm.description}
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted text-center">
                  No items found
                </li>
              )}
            </ul>
          )}
        </p>
        <p><strong>Description:</strong>
          <input
            type="text"
            className="form-control"
            name="itemDescription"
            value={item.itemDescription}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
        <p><strong>Sub Group:</strong>
          <input
            type="text"
            className="form-control"
            name="subGroup"
            value={item.subGroup}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
        <p><strong>Extra Description / Make:</strong>
          <input
            type="text"
            className="form-control"
            name="extraDescription"
            value={item.extraDescription}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
        <p><strong>Current Stock:</strong>
          <input
            type="number"
            className="form-control"
            name="currentStock"
            value={item.currentStock}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
        <p><strong>Required Qty:</strong>
          <input
            type="number"
            className="form-control"
            name="requiredQty"
            value={item.requiredQty}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
        <p><strong>UOM:</strong>
          <input
            type="text"
            className="form-control"
            name="uom"
            value={item.uom}
            onChange={(e) => handleItemChange(index, e)}
          />
        </p>
      </div>
    </div>
  ))}

  {/* Desktop Table */}
  <div className="table-responsive d-none d-md-block">
    <table className="table table-bordered table-striped text-center">
      <thead className="table-primary">
        <tr>
          <th>Sr No</th>
          <th>Item Code</th>
          <th>Description</th>
          <th>Sub Group</th>
          <th>Extra Description / Make</th>
          <th>Current Stock</th>
          <th>Required Qty</th>
          <th>UOM</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.srNo}</td>
            <td className="position-relative">
              <input
                type="text"
                className="form-control"
                name="itemCode"
                value={item.itemCode}
                onFocus={() => setShowItemDropdown(index)}
                readOnly
              />
              {showItemDropdown === index && (
                <ul
                  className="list-group position-absolute w-100 mt-1 shadow-sm"
                  style={{ zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
                >
                  {itemsList.length > 0 ? (
                    itemsList.map((itm) => (
                      <li
                        key={itm._id}
                        className="list-group-item list-group-item-action"
                        onClick={() => selectItem(index, itm)}
                        style={{ cursor: "pointer" }}
                      >
                        {itm.itemCode} - {itm.description}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted text-center">
                      No items found
                    </li>
                  )}
                </ul>
              )}
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                name="itemDescription"
                value={item.itemDescription}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                name="subGroup"
                value={item.subGroup}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                name="extraDescription"
                value={item.extraDescription}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                name="currentStock"
                value={item.currentStock}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
            <td>
              <input
                type="number"
                className="form-control"
                name="requiredQty"
                value={item.requiredQty}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                name="uom"
                value={item.uom}
                onChange={(e) => handleItemChange(index, e)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


          <div className="text-end mb-3">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addRow}
            >
              + Add Item
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Remark</label>
            <textarea
              className="form-control"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-success px-5 fw-semibold">
              Submit Requisition
            </button>
          </div>
        </form>
      </div>

      {/* Approval Status Section */}
      <div className="card mt-4 border-0 shadow-sm p-3 rounded-4 bg-light">
        <h5 className="text-center fw-bold text-secondary mb-3">
          Approval Status
        </h5>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="flex-fill">
            <label className="form-label fw-semibold">Created By</label>
            <input
              type="text"
              className="form-control text-center"
              name="createdBy"
              value={formData.createdBy || "Admin"}
              readOnly
            />
          </div>

          <div className="flex-fill">
            <label className="form-label fw-semibold">HOD Status</label>
            <input
              type="text"
              className={`form-control text-center fw-semibold ${getStatusClass(
                formData.status?.hod
              )}`}
              value={formData.status?.hod || "Pending"}
              readOnly
            />
          </div>

          <div className="flex-fill">
            <label className="form-label fw-semibold">Store Status</label>
            <input
              type="text"
              className={`form-control text-center fw-semibold ${getStatusClass(
                formData.status?.store
              )}`}
              value={formData.status?.store || "Pending"}
              readOnly
            />
          </div>

          <div className="flex-fill">
            <label className="form-label fw-semibold">GM Status</label>
            <input
              type="text"
              className={`form-control text-center fw-semibold ${getStatusClass(
                formData.status?.gm
              )}`}
              value={formData.status?.gm || "Pending"}
              readOnly
            />
          </div>
        </div>

        {lastUpdated && (
          <p className="text-center text-muted mt-3 mb-0 small">
            ⏱ Last updated: {lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
};

export default RequisitionForm;
