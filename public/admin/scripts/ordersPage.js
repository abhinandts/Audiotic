(function(){

    let tableBody,pageList;

    function initializeElements(){
        tableBody = document.getElementById('table-body')
        pageList = document.getElementById('page-list')
    }

    async function fetchAndLoadOrders(page=1){
        try {
            const response = await fetch(`/admin/api/orders/loadOrders/?page=${page}`)

            if(!response.ok){
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            updateOrdersTable(data.orders);
            updatePagination(data.currentPage,data.totalPages)

        } catch (error) {
            console.error(error)
        }
    }

    function updatePagination(currentPage,totalPages){
        pageList.innerHTML = "";

        for(let i=1;i<totalPages;i++){
            const pageItem = createPageItem(i,currentPage)
            pageList.appendChild(pageItem);
        }
    }
    function createPageItem (page,currentPage){
        const item = document.createElement('li')
        item.classList.add('page-item');
        if(page ===currentPage){
            item.classList.add('active')
        }
        item.innerHTML = `
                            <a class="page-link" href="#" data-page="${page}"> ${page} </a>
                        `;
        item.querySelector('a').addEventListener('click',(e)=>{
            e.preventDefault();
            fetchAndLoadOrders(page);
        });
        return item;
    }

    function updateOrdersTable(orders){
        tableBody.innerHTML = "";

        orders.forEach(order => {
            const orderItem = createTableItem(order);
            tableBody.appendChild(orderItem)
        });
    }

    function createTableItem(order){
        const orderItem = document.createElement('tr');

        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString("en-IN")
        const formattedTime = date.toLocaleTimeString("en-IN")

        orderItem.innerHTML = `
                                <td>${ formattedDate } ${formattedTime}</td>
                                <td>${ order.user.email }</td>
                                <td><a href="/admin/showOrder/${ order.orderId }">${ order.orderId }</a></td>
                                <td>
                                    <span
                                        class="badge rounded-pill ${ order.orderStatus === 'Delivered' ? 'alert-success' : order.orderStatus === 'Pending' ? 'alert-warning' : order.orderStatus === 'Shipped' ? 'alert-secondary' : order.orderStatus === 'Processing' ? 'alert-info' : (order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') ? 'alert-danger' : 'alert-warning' }"
                                    >
                                        ${ order.orderStatus }
                                    </span>
                                </td>
                                <td>
                                    <span
                                        class="badge rounded-pill ${ order.paymentStatus === 'Paid' ? 'alert-success' : order.paymentStatus === 'Pending' ? 'alert-warning' : order.paymentStatus === 'Refunded' ? 'alert-secondary' : order.paymentStatus === 'Failed' ? 'alert-danger' : order.paymentStatus === 'Not Applicable' ? 'alert-info' : '' }"
                                    >
                                        ${ order.paymentStatus }
                                    </span>
                                    </td>
                                <td>${ order.orderTotal.toLocaleString("en-IN") } .00</td>
                            `
        return orderItem;
    }


    function init(){
        initializeElements()
        fetchAndLoadOrders()
    }
    document.addEventListener('DOMContentLoaded',init())
})()