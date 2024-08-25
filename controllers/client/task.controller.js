const Task = require("../../models/task.model");

// [GET] /tasks
module.exports.index = async (req, res) => {
    const find = {
        deleted: false 
    };

    // Lọc theo trạng thái
    const status = req.query.status;
    
    if(status){
        find.status = status;
    }
    // Hết Lọc theo trạng thái

    // Sắp xếp
    const sort = {};

    const sortKey = req.query.sortKey;
    const sortValue = req.query.sortValue;

    if(sortKey && sortValue){
        sort[sortKey] = sortValue;
    }
    // Hết Sắp xếp

    // Phân trang
    let limitItems = 2;
    if(req.query.limitItems){
        limitItems = parseInt(req.query.limitItems);
    }

    let page = 1;
    if(req.query.page){
        page = parseInt(req.query.page);
    }

    const skip = (page - 1) * limitItems;
    // Hết Phân trang


    const tasks = await Task
        .find(find)
        .limit(limitItems)
        .skip(skip)
        .sort(sort);
    
    res.json(tasks);
}

// [GET] /tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const task = await Task.findOne({
            _id: id,
            deleted: false
        });

        res.json(task);
    } catch (error) {
        res.json({
            message: "Not Found"
        });
    }
}