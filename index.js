const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

//Tạo sever

app.listen(PORT,function (){
    console.log("sever is running...")
});
//config các file static
app.use(express.static("public"));

//app.get("/",function (req,res) {
//res.send("Đây là trang chủ!");

//});
//config sử dụng ejs
app.set("view engine","ejs");
//config connect MSSQL
const mssql = require("mssql");
const config = {
    server:'cloud-apt.database.windows.net',
    database:'Development',
    user: 'quanghoa',
    password: 'Studentaptech123'
}
//const config = {
//  user: 'quanghoa',
//password: 'Studentaptech123',
//server: 'cloud-apt.database.windows.net',
//database: 'T2004E',
//options: {
//  encrypt: false,
// enableArithAbort: true
//}
//}
mssql.connect(config,function (err){
    if(err) console.log(err);
    else console.log("connect db thành công");
});
//tạo đối tượng truy vấn dữ liệu
var db = new mssql.Request();

//trang chủ
app.get("/",function(req,res){
    //lay du lieu
    db.query("SELECT * FROM Lab4_KhachHang", function(err,rows){
        if(err) res.send("No value");
        else
            res.render("home",{
                khs:rows.recordset
            })
        //res.send(rows.recordset);
    })
    //res.render("home");
});
app.get("/search",function (req,res){
    let key_search ="'%"+req.query.keyword+"%'";
    //lấy dữ liệu
    db.query("select * from Lab4_KhachHang WHERE TenKH LIKE "+key_search,function (err,rows){
        if(err) res.send("không có kết quả");
        else
            res.render("home",{
                khs:rows.recordset
            })
    })
    //res.render("home")
});
//map.function(value) vòng lặp
app.get("/danhsachsanpham",function (req,res){
    db.query("select * from Lab4_SanPham",function (err,rows){
        if (err) res.send("no values");
        else
            res.render("sp",{
                sps:rows.recordset
            })
    })
})
//link trả về form thêm khách hàng
app.get("/them-khach-hang",function (req,res){
    res.render("form");
})
//link nhận dữ liệu để thêm vào db
const bodyParser =require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.post("/luu-khach-hang",function (req,res){
    let ten = req.body.TenKH;
    let dt = req.body.DienThoai;
    let dc = req.body.DiaChi;
    res.send(ten);
    let sql_text = "INSERT INTO Lab4_KhachHang(TenKH,DienThoai,DiaChi) VALUES(N'"+ten+"',N'"+dt+"',N'"+dc+"')"
    //db.query(sql_text,function(err,rows){
     //   if(err) res.send(err);
    //    else res.send("Them Khach Hang Thanh Cong!");
   // })
//})

db.query(sql_text,function(err,rows){
if(err) res.send(err);
else res.redirect("/");
})
})



app.get("/san-pham",function(req,res){
    //lay du lieu
    db.query("SELECT * FROM Lab4_SanPham", function(err,rows){
        if(err) res.send("No value");
        else
            res.render("sp",{
                sps:rows.recordset
            });

    })
});


//link trả về form them san pham
app.get("/them-san-pham",function (req,res){
    res.render("themsp");
})
//link nhận dữ liệu để thêm vào db

app.post("/luu-san-pham",function (req,res){
    let tensp = req.body.TenSP;
    let mt = req.body.MoTa;
    let dv = req.body.DonVi;
    let gia = req.body.Gia;
    let sql_text = "INSERT INTO Lab4_SanPham(TenSP,MoTa,DonVi,Gia) VALUES(N'"+tensp+"',N'"+mt+"',N'"+dv+"',N'"+gia+"')"
    db.query(sql_text,function(err,rows){
        if(err) res.send(err);
        else res.redirect("/san-pham");
    })
})


//Tao form don hang
app.get("/tao-don-hang",function(req,res){
    let sql_text="SELECT * FROM Lab4_KhachHang;SELECT * FROM Lab4_SanPham";
    db.query(sql_text,function(err,rows){
        if(err) res.send(err);
        else{
            res.render("donhang",{
                khs:rows.recordset[0],
                sps:rows.recordset[1],
            })
        }
    })


})

//nhap du lieu de tao don hang
app.post("/luu-don-hang",function(req,res){
    let khID = req.body.KhachHangID;
    let spID= req.body.SanPhamID;
    let tien=req.body.TongTien;
    let sql_text="SELECT * FROM Lab4_SanPham WHERE ID IN ("+spID+");";
    db.query(sql_text,function(err,rows){
        if(err) res.send(err);
        else
        {
            let sps = rows.recordset;
            let tongtien=0;
            sps.map(function(e){
                tongtien +=e.Gia;
            });
            let sql_text2="INSERT INTO Lab4_DonHang(KhachHangID,TongTien,ThoiGian) VALUES("+khID+","+tongtien+",GETDATE();SELECT SCOPE_IDENTITY() As MaSo)"
    db.query(sql_text2,function(err,rows){
let donhang=rows.recordset[0];
let MaSo=donhang.MaSo;
let sql_text3="";
sps.map(function(e){
    sql_text3+="INSERT INTO Lab4_DonHang_SanPham(MaSo,SanPhamID,SoLuong,ThanhTien" + "VALUES("+MaSo+","+e.ID+""
})
    })
        }
    })
    //res.send(spID)
})
app.get("/chi-tiet-khach-hang/:id", async function (req,res){
    let khid = req.params.id;
    let sql_text = "SELECT * FROM Lab4_KhachHang WHERE ID ="+khid;
    let kh ="Khong co";
   await db.query(sql_text).then(result=>{ /*If successful*/
       kh=result;
   }).catch(err=>{ /*If not successful*/
       console.log(err)
   });
   let sql_text2 ="SELECT * FROM Lab4_DonHang WHERE KhachHangID = "+khid;
   let donhang=[];
   await db.query(sql_text2 ).then (result=>{
       donhang = result;
   }).catch(function(err){
       console.log(err)
   });
    await res.render("khachhang",{
        khachhang:kh.recordset[0],
        donhang:donhang.recordset
    });

})
/*
làm cho 2 lệnh chờ nhau, lệnh 1 thực hiện xong lệnh 2 mới được chạy, hàm then để chạy 2 lệnh liên tiếp nhau
phải có cả async ở đầu mới chạy đc await và ngược lại*/

