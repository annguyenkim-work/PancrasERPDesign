# Feature Specification: Giữ hàng khi ghi nhận đơn bán

**Feature Branch**: `001-reserve-sale-stock`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Khi nhân viên ghi nhận đơn bán, hệ thống giữ số lượng tại kho đã chọn ngay lúc ghi nhận. Không chờ đến lúc giao xe. Không bán nếu kho không đủ số lượng đã chọn. Tồn không xuống dưới 0. Hai người cùng lấy số cuối: ai ghi nhận trước được số đó. Người sau không tạo được đơn với số lượng đã chọn. Hệ thống báo kho không còn đủ. Người sau giảm số lượng, chọn kho khác, hoặc bỏ dòng hàng. Số cuối không chia đôi. Không giữ cả hai đơn rồi xử lý sau. Người dùng là nhân viên được phép lập đơn bán. Kho là một địa điểm loại kho hoặc showroom đang có tồn. Ngoài phạm vi: giá, chiết khấu, thuế, công nợ, combo, nhập khẩu, bảo hành, phân quyền chi tiết."

## Clarifications

### Session 2026-11-05

- Q: Khi người thứ nhất đã ghi nhận đơn nhưng đơn vẫn chờ duyệt, người thứ hai thấy số có thể bán thế nào? → A: Đơn chờ duyệt đã giữ hàng. Người thứ hai thấy số đã giảm. Form chưa ghi nhận thì người thứ hai vẫn thấy số cũ.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Giữ hàng ngay khi ghi nhận đơn (Priority: P1)

Nhân viên được phép lập đơn bán chọn một mặt hàng, một số lượng, và một địa điểm loại kho hoặc showroom đang có đủ tồn. Khi nhân viên ghi nhận đơn, số có thể bán tại đúng địa điểm đó giảm ngay bằng số lượng đã ghi nhận. Đơn vừa ghi nhận có thể đang chờ duyệt hoặc đã duyệt. Cả hai trường hợp đều đã giữ hàng. Việc giảm này xảy ra trước mọi bước giao xe và trước lúc đơn chờ duyệt được chuyển sang đã duyệt. Form đang mở, chưa bấm ghi nhận, không giữ hàng. Người khác lúc đó vẫn thấy số cũ.

**Why this priority**: Đây là việc chặn bán trùng. Nếu hàng chỉ bị giữ lúc giao xe, hai người vẫn thấy còn hàng và cùng lập đơn.

**Independent Test**: Chuẩn bị một kho hoặc một showroom còn đủ số lượng cho một dòng hàng. Ghi nhận đơn và để đơn ở chờ duyệt. Kiểm tra số có thể bán giảm đúng bằng số đã ghi, người thứ hai nhìn thấy số mới, và chưa có bước giao xe hay bước duyệt nào.

**Acceptance Scenarios**:

1. **Given** một kho còn 5 cái của một mặt hàng, **When** nhân viên ghi nhận đơn bán 2 cái tại kho đó và đơn đang chờ duyệt, **Then** số có thể bán tại kho đó còn 3. Người thứ hai nhìn số tại kho đó thấy 3, trước khi có giao xe và trước khi đơn được duyệt.
2. **Given** đơn ở kịch bản trên đang chờ duyệt và số có thể bán còn 3, **When** đơn được chuyển sang đã duyệt, **Then** số có thể bán vẫn là 3.
3. **Given** một showroom còn 4 cái của một mặt hàng, **When** nhân viên ghi nhận đơn bán 4 cái tại showroom đó và đơn được ghi nhận thẳng thành đã duyệt, **Then** số có thể bán tại showroom đó còn 0. Số tại các kho khác không đổi.
4. **Given** một kho còn 1 cái, **When** hai nhân viên cùng mở form và chưa ai bấm ghi nhận, **Then** cả hai vẫn thấy số có thể bán là 1.

---

### User Story 2 - Không bán khi kho không đủ (Priority: P2)

Nhân viên chọn số lượng lớn hơn số có thể bán tại địa điểm đã chọn. Hệ thống không ghi nhận đơn với số lượng đó. Số có thể bán không đổi và không xuống dưới 0. Nhân viên giảm số lượng cho vừa phần còn lại, chọn kho hoặc showroom khác còn đủ, hoặc bỏ dòng hàng. Khi mọi dòng còn lại đều đủ hàng, nhân viên ghi nhận được đơn và chỉ những dòng trên đơn đó mới bị giữ.

**Why this priority**: Giữ hàng chỉ đúng nếu lần bán vượt tồn bị chặn. Đây là lối nhân viên xử lý khi không mua được đủ số đã chọn.

**Independent Test**: Với một địa điểm còn 2 cái, thử ghi nhận 3 cái và xác nhận không có đơn mới, số vẫn là 2. Sau đó giảm còn 2, hoặc đổi sang địa điểm còn đủ, hoặc bỏ dòng, rồi ghi nhận thành công.

**Acceptance Scenarios**:

1. **Given** một kho còn 2 cái, **When** nhân viên ghi nhận đơn bán 3 cái tại kho đó, **Then** đơn không được tạo, hệ thống báo kho không còn đủ, và số có thể bán vẫn là 2.
2. **Given** lần ghi nhận vừa bị từ chối vì kho còn 2 nhưng đơn xin 3, **When** nhân viên giảm dòng đó còn 2 và ghi nhận lại, **Then** đơn được ghi nhận và số có thể bán tại kho đó còn 0.
3. **Given** kho đã chọn còn 1 cái và một showroom khác còn 3 cái, **When** nhân viên đổi dòng sang showroom đó với số lượng 3 và ghi nhận, **Then** đơn được ghi nhận, showroom còn 0, và kho ban đầu vẫn còn 1.
4. **Given** một đơn có hai dòng, dòng thứ nhất đủ hàng và dòng thứ hai vượt tồn tại kho của dòng đó, **When** nhân viên ghi nhận, **Then** cả đơn không được tạo và không dòng nào bị giữ.
5. **Given** đơn bị từ chối vì một dòng vượt tồn, **When** nhân viên bỏ dòng đó và dòng còn lại đủ hàng, **Then** nhân viên ghi nhận được đơn và chỉ dòng còn lại bị giữ.

---

### User Story 3 - Hai người cùng lấy số cuối (Priority: P3)

Hai nhân viên cùng muốn số lượng cuối tại một địa điểm. Người ghi nhận đơn trước được trọn số đó. Người ghi nhận sau không tạo được đơn với số lượng đã chọn, kể cả khi lúc mở đơn người đó vẫn thấy còn hàng. Hệ thống báo kho không còn đủ. Người sau giảm số lượng, chọn địa điểm khác, hoặc bỏ dòng hàng. Số cuối không bị chia cho cả hai đơn. Hệ thống không giữ cả hai đơn để xử lý sau.

**Why this priority**: Đây là tình huống dễ bán trùng nhất. Quy tắc phải nhìn thấy được bằng hai đơn thật, không chỉ bằng một người thử vượt tồn.

**Independent Test**: Để một địa điểm còn đúng 1 cái. Hai nhân viên cùng lập đơn 1 cái. Chỉ một đơn được ghi nhận. Người kia thấy báo kho không còn đủ và chỉ đi tiếp được sau khi giảm số lượng, đổi địa điểm còn hàng, hoặc bỏ dòng.

**Acceptance Scenarios**:

1. **Given** một kho còn 1 cái và hai nhân viên cùng chọn 1 cái tại kho đó, **When** người thứ nhất ghi nhận trước và đơn đó đang chờ duyệt, **Then** kho còn 0, người thứ hai thấy số đã giảm, và đơn của người thứ hai không được tạo.
2. **Given** người thứ hai đã mở form từ lúc kho còn 1 cái, **When** người thứ nhất đã ghi nhận và người thứ hai vẫn bấm ghi nhận số lượng cũ, **Then** hệ thống báo kho không còn đủ và không có đơn thứ hai.
3. **Given** người thứ hai vừa bị từ chối, **When** người thứ hai giảm số lượng, chọn kho hoặc showroom khác còn đủ, hoặc bỏ dòng hàng, rồi ghi nhận một đơn hợp lệ, **Then** chỉ đơn hợp lệ đó được ghi nhận thêm. Số cuối tại kho ban đầu không bị chia đôi. Lần bị từ chối không tạo đơn để xử lý sau. Đơn chờ duyệt của người thứ nhất vẫn giữ số đó.

---

### Edge Cases

- Số lượng xin đúng bằng số có thể bán: đơn được ghi nhận và số có thể bán còn 0, không xuống dưới 0.
- Số lượng xin lớn hơn số có thể bán đúng 1: đơn không được tạo, số có thể bán không đổi.
- Nhiều dòng trên cùng một đơn lấy cùng một mặt hàng tại cùng một địa điểm: hệ thống cộng số lượng các dòng đó. Nếu tổng vượt số có thể bán, đơn không được tạo và không dòng nào bị giữ.
- Địa điểm đã chọn còn 0: dòng có số lượng lớn hơn 0 không ghi nhận được tại địa điểm đó.
- Đổi sang địa điểm khác nhưng địa điểm mới cũng không đủ: đơn vẫn không được tạo, cả hai địa điểm giữ nguyên số có thể bán.
- Giảm số lượng rồi vẫn còn cao hơn số có thể bán: đơn vẫn không được tạo.
- Bỏ hết dòng trên đơn: không có đơn để ghi nhận và không có hàng bị giữ.
- Ghi nhận tại showroom không làm giảm số có thể bán của kho, và ngược lại.
- Người sau không được một phần của số cuối. Không có hai đơn cùng được giữ để chia lại sau.
- Form đang mở và chưa bấm ghi nhận: số có thể bán không đổi. Người khác vẫn thấy số cũ.
- Đơn đã ghi nhận và đang chờ duyệt: số có thể bán đã giảm. Người khác nhìn địa điểm đó thấy số mới.
- Đơn chờ duyệt chuyển sang đã duyệt: số có thể bán không giảm thêm.
- Đơn đã giữ hàng bị từ chối hoặc bị hủy: [NEEDS CLARIFICATION: số đang giữ có trả lại số có thể bán không, và trả lại ở bước nào?]
- Sửa số lượng hoặc đổi địa điểm sau khi đơn đã ghi nhận và chưa xuất chứng từ bán: [NEEDS CLARIFICATION: phần đang giữ đổi ngay lúc lưu sửa, hay đến lúc xuất chứng từ? Số dùng để kiểm tra đủ hàng có cộng lại phần chính đơn đó đang giữ không?]
- Lúc xuất kho đủ đơn: số có thể bán không giảm thêm. Phần đang giữ của các mặt hàng trên phiếu xuất được giải vì hàng đã đi. Chi tiết nằm ở spec `015-tach-xuat-hoa-don`.
- Hàng đang điều chuyển: [NEEDS CLARIFICATION: số đó có được tính vào số có thể bán của kho đi, của kho đến, hay chưa được bán cho đến khi nhận?]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST giữ số lượng của từng dòng tại đúng kho hoặc showroom đã chọn ngay khi đơn bán được ghi nhận thành công. Đơn đang chờ duyệt và đơn đã duyệt ngay lúc ghi nhận đều đã giữ hàng.
- **FR-002**: Việc giữ hàng MUST hoàn tất trước mọi bước giao xe và trước khi đơn chờ duyệt được chuyển sang đã duyệt. Form chưa bấm ghi nhận MUST NOT giữ số lượng. Trong lúc form chưa ghi nhận, người khác MUST vẫn thấy số có thể bán cũ.
- **FR-003**: Hệ thống MUST NOT ghi nhận đơn khi địa điểm đã chọn không còn đủ số lượng của dòng đó.
- **FR-004**: Số có thể bán tại một địa điểm MUST NOT xuống dưới 0.
- **FR-005**: Khi số lượng ghi nhận đúng bằng số có thể bán, hệ thống MUST ghi nhận đơn và số có thể bán còn 0.
- **FR-006**: Lần ghi nhận không thành công MUST NOT tạo đơn và MUST NOT giữ bất kỳ dòng nào của lần thử đó.
- **FR-007**: Với một đơn có nhiều dòng, hệ thống MUST chỉ ghi nhận khi mọi dòng đều đủ hàng tại địa điểm của dòng đó. Các dòng cùng mặt hàng, cùng địa điểm MUST được cộng lại trước khi so với số có thể bán.
- **FR-008**: Khi hai nhân viên cùng lấy một số lượng cuối, người ghi nhận đơn trước MUST được trọn số đó. Người kia MUST NOT tạo được đơn với số lượng đã chọn.
- **FR-009**: Với người không ghi nhận được, hệ thống MUST báo kho không còn đủ, kể cả khi lúc mở đơn người đó vẫn thấy còn hàng.
- **FR-010**: Người không ghi nhận được MUST có thể giảm số lượng, chọn một kho hoặc showroom khác, hoặc bỏ dòng hàng, rồi ghi nhận lại khi phần còn lại đủ hàng.
- **FR-011**: Hệ thống MUST NOT chia số lượng cuối cho hai đơn. Hệ thống MUST NOT giữ cả hai đơn để xử lý sau.
- **FR-012**: Địa điểm trên một dòng MUST là một kho hoặc một showroom. Giữ hàng tại địa điểm đã chọn MUST NOT làm đổi số có thể bán tại địa điểm khác.
- **FR-013**: Sau khi một đơn được ghi nhận, kể cả khi đơn vẫn chờ duyệt, lần xem tiếp theo tại đúng địa điểm MUST cho thấy số có thể bán đã giảm. Lần xem này MUST NOT cần một bước giao xe hay một bước duyệt ở giữa.
- **FR-014**: Khi đơn chờ duyệt chuyển sang đã duyệt, hệ thống MUST NOT giữ thêm một lần nữa.
- **FR-015**: Khi đơn đã giữ hàng bị từ chối duyệt hoặc bị hủy, hệ thống MUST [NEEDS CLARIFICATION: trả số đang giữ về số có thể bán ngay, trả ở một bước khác, hay chưa có quy tắc. Phần Chưa chốt chưa có câu trả lời.]
- **FR-016**: Khi sửa số lượng hoặc đổi địa điểm của đơn đã ghi nhận nhưng chưa xuất chứng từ bán, hệ thống MUST [NEEDS CLARIFICATION: phần đang giữ đổi ngay lúc lưu sửa, hay đến lúc xuất chứng từ? Số dùng để kiểm tra đủ hàng có cộng lại phần chính đơn đó đang giữ không? Ai được sửa nằm ở spec `008-ban-hang`.]
- **FR-017**: Lúc xuất kho đủ đơn, số có thể bán MUST NOT giảm thêm. Phần đang giữ của các mặt hàng trên phiếu xuất MUST được giải vì hàng đã đi. Phiếu xuất và việc tách chứng từ thanh toán nằm ở spec `015-tach-xuat-hoa-don`.
- **FR-018**: Hàng đang điều chuyển MUST [NEEDS CLARIFICATION: được tính vào số có thể bán của kho đi, của kho đến, hay chưa được bán cho đến khi nhận. Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Đơn bán**: Việc bán mà nhân viên ghi nhận. Đơn chỉ tồn tại sau lần ghi nhận thành công và lúc đó đang chờ duyệt hoặc đã duyệt. Cả hai trạng thái đều đã giữ hàng. Form chưa bấm ghi nhận không phải một đơn bán. Đơn có ít nhất một dòng hàng.
- **Dòng hàng**: Một mặt hàng, một số lượng, và một địa điểm đã chọn trên đơn. Số lượng là số nguyên lớn hơn 0.
- **Địa điểm tồn**: Một kho hoặc một showroom có số có thể bán theo từng mặt hàng. Nhân viên chọn một địa điểm cho mỗi dòng.
- **Số có thể bán**: Số lượng nhân viên nhìn thấy tại một địa điểm cho một mặt hàng. Số này giảm đúng bằng số đã ghi nhận và không bao giờ dưới 0. Hàng đang điều chuyển có nằm trong số này hay không là [NEEDS CLARIFICATION: kho đi, kho đến, hay chưa tính cho đến khi nhận?]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 10 lần ghi nhận mà địa điểm đã chọn còn đủ hàng, cả 10 đơn đều được ghi nhận, và số có thể bán giảm đúng bằng số lượng trên đơn trước khi có bất kỳ giao xe nào.
- **SC-002**: Trong 10 lần cố ghi nhận nhiều hơn số có thể bán, không lần nào tạo được đơn. Số có thể bán sau mỗi lần thử giữ nguyên và không lần nào dưới 0.
- **SC-003**: Trong 10 cặp thử cùng lấy 1 cái cuối tại một địa điểm, mỗi cặp chỉ có đúng 1 đơn được ghi nhận cho cái đó. 10/10 người ghi nhận sau đều thấy báo kho không còn đủ. Không cặp nào chia cái cuối, và không cặp nào để lại hai đơn chờ xử lý.
- **SC-004**: Sau khi đơn đầu được ghi nhận và vẫn đang chờ duyệt, 10/10 lần xem tiếp theo tại đúng địa điểm đều thấy số có thể bán mới, mà không có bước giao xe hay bước duyệt nào xen vào.
- **SC-005**: Cả 3 đường xử lý (giảm số lượng cho vừa phần còn, đổi sang địa điểm khác còn đủ, bỏ dòng không đủ) đều ghi nhận được đơn ở lần thử kế tiếp, và chỉ hàng trên đơn đã ghi nhận mới bị giữ.
- **SC-006**: Trong 10 lần một nhân viên đang mở form và chưa bấm ghi nhận, 10/10 người khác vẫn thấy số có thể bán cũ tại địa điểm đó.

## Assumptions

- Người dùng trong spec này là nhân viên đã được phép lập đơn bán. Bảng quyền hiện chỉ là đề xuất. Spec này không chọn vai trò nào được lập đơn.
- Mỗi dòng gắn với đúng một địa điểm, và địa điểm đó là kho hoặc showroom.
- Số lượng trên dòng là số nguyên lớn hơn 0. Hệ thống không chia lẻ một cái cho nhiều đơn.
- Form chưa bấm ghi nhận không giữ hàng. Người khác vẫn thấy số cũ. Hàng bị giữ khi đơn được ghi nhận thành công, kể cả khi đơn đang chờ duyệt. Chuyển đơn đó sang đã duyệt không giữ thêm.
- Nếu một dòng trên đơn không đủ hàng, cả lần ghi nhận đó không tạo đơn và không giữ các dòng khác của lần thử đó.
- Đơn không có dòng hàng thì không được ghi nhận.
- Số liệu trên bản demo chỉ để hình dung màn hình, không phải hạn mức hay tồn thật.
- Ngoài phạm vi, và spec này không chọn phương án: giá, chiết khấu, thuế, công nợ, combo, nhập khẩu, bảo hành, phân quyền chi tiết, kiểm kê, chuyển báo giá thành đơn, và cách ghi doanh số.
- Ba việc sau chạm đến số có thể bán nhưng chưa có câu trả lời. Chúng được đánh dấu [NEEDS CLARIFICATION] ở FR-015, FR-016 và FR-018 và không phải quy tắc: hủy hoặc từ chối đơn đã giữ hàng, sửa số lượng hoặc đổi địa điểm trước khi xuất chứng từ bán, và hàng đang điều chuyển.
- Lúc xuất kho đủ đơn, số có thể bán không giảm thêm. Phần đang giữ được giải vì hàng đã đi, theo FR-017 và spec `015-tach-xuat-hoa-don`.
- Ai được sửa đơn trước khi xuất chứng từ bán nằm ở spec `008-ban-hang`. Spec này không chọn vai trò.
