# Spec nghiệp vụ PancrasERP

Bản demo UI chỉ để hình dung màn hình. Những mục dưới đây là việc cần chốt trước khi làm thật. Phần **Đã chốt** là quyết định. Phần **Chưa chốt** để đi hỏi khách rồi điền câu trả lời vào ô trống.

## Đã chốt

### Không bán âm

Không được bán khi kho không còn đủ số lượng. Tồn không được xuống dưới 0.

### Hai người cùng lấy số cuối

Ai ghi nhận đơn trước thì được số hàng đó. Người còn lại không tạo được đơn với số lượng đã chọn. Hệ thống báo kho không còn đủ. Người đó giảm số lượng, chọn kho khác, hoặc bỏ dòng hàng.

Số cuối không chia đôi. Không giữ cả hai đơn rồi xử lý sau.

Hàng bị giữ ngay khi đơn được ghi nhận. Không chờ đến lúc giao xe mới trừ, vì nếu chỉ kiểm tra lúc mở form thì cả hai người vẫn thấy còn hàng.

## Chưa chốt

### Giá, chiết khấu, thuế

- Giá có khóa theo hợp đồng hoặc theo từng khách, hay lúc bán luôn lấy bảng giá hiện hành (lẻ, đại lý, dự án)?
  - Trả lời:

- Ai được chiết khấu, mức tối đa bao nhiêu, vượt mức thì ai duyệt? Đơn lẻ có được chiết khấu không?
  - Trả lời:

- Thuế suất nào? Hàng nào không chịu thuế? Giá niêm yết đã gồm VAT hay chưa?
  - Trả lời:

- Lắp đặt có tính thành một dòng doanh thu riêng không?
  - Trả lời:

### Bán hàng và thu tiền

- Khách lẻ có được đặt cọc hoặc ghi nợ không? Dự án có thu tạm ứng theo đợt không?
  - Trả lời:

- Đơn được sửa đến bước nào, hủy ở bước nào? Hủy thì công nợ và hàng đang giữ xử lý thế nào?
  - Trả lời:

- Showroom có được xuất đơn đại lý hoặc đơn công trình không, hay chỉ đơn khách lẻ?
  - Trả lời:

### Công nợ

- Dư nợ bị chiếm từ lúc đơn chờ duyệt, hay chỉ khi đơn đã được duyệt?
  - Trả lời:

- Khóa đơn khi quá hạn, khi vượt hạn mức, hay cả hai? Quá hạn tính từ ngày nào?
  - Trả lời:

- Khách trả một khoản thì phân vào đơn nào? Có nhận tiền thừa thành tiền ứng trước không? Trả hết thì mở khóa tự động hay kế toán mở tay?
  - Trả lời:

### Hàng và kho

- Hàng đang điều chuyển tính là tồn kho đi, tồn kho đến, hay tồn trên đường?
  - Trả lời:

- Hao hụt trên đường ghi vào đâu?
  - Trả lời:

- Ai được duyệt kiểm kê? Chênh lệch có bắt buộc lý do và chứng từ không?
  - Trả lời:

### Combo

- Bán combo là trừ từng linh kiện, hay trừ một bộ đã đóng sẵn trong kho?
  - Trả lời:

- Giá vốn combo có cộng công đóng gói không?
  - Trả lời:

### Nhập khẩu và giá vốn

- Chi phí nhập có tách cách phân bổ không: thuế theo trị giá, cước theo khối lượng? Hay cả cụm chi phí dùng một cách?
  - Trả lời:

- Khối lượng lấy theo đơn vị nào? Hàng tính theo m² quy ra kg thế nào?
  - Trả lời:

- Giá vốn dùng chung toàn công ty, hay từng kho một giá?
  - Trả lời:

- Tỷ giá USD chốt lúc lập đơn mua, lúc tờ khai, hay lúc thanh toán nhà cung cấp?
  - Trả lời:

### Dự án

- Một chủ đầu tư có nhiều hợp đồng và nhiều công trình không?
  - Trả lời:

- Đơn có được vượt giá trị hợp đồng không?
  - Trả lời:

- Một đợt bàn giao có được tách nhiều đơn và giao một phần không? Phần còn lại theo dõi thế nào?
  - Trả lời:

- Thu tiền theo đợt giao, theo mốc nghiệm thu, hay theo phần trăm giá trị hợp đồng?
  - Trả lời:

- Ai nhập số hợp đồng và phụ lục?
  - Trả lời:

- Giá công trình khóa lúc ký, hay mỗi lần giao lại lấy giá và chiết khấu hiện tại?
  - Trả lời:

### Báo giá

- Báo giá hiệu lực bao lâu, sửa được mấy lần?
  - Trả lời:

- Khi chuyển thành đơn thì giữ giá đã báo, hay lấy giá mới?
  - Trả lời:

### Bảo hành

- Hạn bảo hành tính từ ngày bán, ngày giao, hay ngày khách kích hoạt?
  - Trả lời:

- Mặt hàng nào quản theo serial, mặt hàng nào theo số lượng?
  - Trả lời:

- Đổi trả và bảo hành có nhập lại kho không? Có giảm công nợ hoặc xuất hóa đơn điều chỉnh không?
  - Trả lời:

### Doanh số và khách hàng

- Doanh số ghi nhận lúc duyệt đơn, lúc giao hàng, hay lúc thu tiền? Hàng trả có trừ doanh số không?
  - Trả lời:

- Nhân viên kinh doanh chỉ thấy khách của mình, hay thấy chung?
  - Trả lời:

### Bảng quyền

Khách sửa từng ô thành **Có** hoặc **Không**. Ô đang ghi là đề xuất theo bản demo, chưa phải quyết định.

Sửa giá và kiểm kê được tách thành hai việc, vì một từ đang gộp hai quyền khác nhau.

| Việc | Admin | Giám đốc | Kế toán | Sales | Thủ kho | Trưởng showroom | CSKH |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lập đơn bán (lẻ, đại lý, dự án) | Có | Có | Không | Có | Không | Có | Không |
| Lập báo giá và xuất catalog | Có | Có | Không | Có | Không | Có | Không |
| Sửa bảng giá niêm yết (lẻ, đại lý, dự án) | Có | Có | Có | Không | Không | Không | Không |
| Sửa chiết khấu trên một đơn, trong mức của khách | Có | Có | Không | Có | Không | Có | Không |
| Duyệt chiết khấu vượt mức | Có | Có | Không | Không | Không | Không | Không |
| Duyệt đơn vượt hạn mức hoặc nợ quá hạn | Có | Có | Có | Không | Không | Không | Không |
| Thu tiền và gạch nợ | Có | Có | Có | Không | Không | Không | Không |
| Nhập kho đơn mua | Có | Có | Có | Không | Có | Không | Không |
| Lập phiếu kiểm kê | Có | Có | Không | Không | Có | Có | Không |
| Duyệt kiểm kê, sổ nhận bằng số đếm | Có | Có | Có | Không | Không | Không | Không |
| Thêm và sửa hồ sơ nhân viên | Có | Có | Không | Không | Không | Không | Không |

- Khách muốn thêm hoặc bớt vai trò nào không?
  - Trả lời:

- Khách muốn đổi ô nào so với bảng trên?
  - Trả lời:
