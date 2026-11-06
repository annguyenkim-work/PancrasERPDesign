# Feature Specification: Bán hàng lẻ, đại lý, nhà phân phối và dự án

**Feature Branch**: `008-ban-hang`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Bán hàng: lọc đơn lẻ, đại lý, dự án; lập đơn mới từ một kho hoặc showroom; xem đơn chờ duyệt; duyệt ngoại lệ công nợ; chuyển đơn đã duyệt sang soạn xuất, giao xe và hoàn tất; in phiếu."

## Clarifications

### Session 2026-11-06

- Q: Hóa đơn và phiếu bán hàng là hai chứng từ hay một? → A: Phiếu xuất kho là một chứng từ cho mọi mặt hàng đã đi cùng một chuyến. Chứng từ thanh toán lập sau phiếu xuất và có thể tách thành hai chứng từ con, theo spec `015-tach-xuat-hoa-don`.
- Q: Ai được sửa đơn trước khi xuất chứng từ này? → A: Kế toán, Giám đốc và Admin được sửa khách, dòng hàng và số lượng.
- Q: Nhà phân phối có phải loại khách thứ tư không? → A: Có. Bốn loại là lẻ, đại lý, nhà phân phối và dự án.
- Q: Nhập tệp báo giá có tạo đơn ngay không? → A: Không. Tệp chỉ điền form. Người dùng xem lại, sửa nếu cần, rồi bấm tạo. Hàng chỉ giữ khi bấm tạo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem và lọc đơn (Priority: P1)

Nhân viên thấy danh sách đơn với mã, khách, loại lẻ, đại lý, nhà phân phối hoặc dự án, kho hoặc showroom xuất, nhân viên bán và trạng thái. Nhân viên lọc tất cả, lẻ, đại lý, nhà phân phối hoặc dự án, và tìm theo mã đơn, tên khách hoặc tên nhân viên.

**Why this priority**: Mở màn là để tìm đơn đang có.

**Independent Test**: Lọc nhà phân phối và tìm một mã đơn, chỉ còn đơn khớp.

**Acceptance Scenarios**:

1. **Given** có đơn cả bốn loại, **When** nhân viên chọn Nhà phân phối, **Then** chỉ còn đơn nhà phân phối. Đơn đại lý không nằm trong danh sách đó.
2. **Given** nhân viên gõ một mã đơn, **When** danh sách lọc, **Then** chỉ còn đơn khớp mã, tên khách hoặc tên nhân viên trong loại đang chọn.
3. **Given** một đơn đang chờ duyệt và dòng đó có lý do kiểm soát tín dụng, **When** nhân viên xem đơn đó, **Then** thấy dấu chờ duyệt và đúng lý do đang ghi trên đơn.
4. **Given** bộ lọc đang để lại 2 đơn, **When** nhân viên xuất danh sách, **Then** tệp có đúng 2 đơn đó.

---

### User Story 2 - Lập đơn bán (Priority: P2)

Nhân viên tạo đơn: chọn loại khách, khách hoặc tên khách lẻ, điện thoại, địa chỉ giao, địa điểm xuất là một kho hoặc showroom, và ít nhất một dòng hàng với số lượng. Với khách dự án, nhân viên chọn được một đợt bàn giao nếu khách đó có đợt. Bấm ghi nhận thì việc giữ hàng theo spec `001-reserve-sale-stock`: đơn chờ duyệt hoặc đã duyệt đều đã giữ hàng tại địa điểm đã chọn; form chưa bấm ghi nhận thì người khác vẫn thấy số cũ.

**Why this priority**: Lập đơn là việc bán. Quy tắc giữ hàng đã chốt nằm ở spec giữ hàng.

**Independent Test**: Ghi nhận một đơn đủ hàng tại một kho và thấy đơn trong danh sách, số có thể bán tại kho đó giảm đúng bằng số đã ghi.

**Acceptance Scenarios**:

1. **Given** kho còn đủ hàng, **When** nhân viên ghi nhận đơn một dòng tại kho đó, **Then** đơn xuất hiện trong danh sách và số có thể bán tại kho đó giảm đúng số lượng dòng, trước khi giao xe.
2. **Given** kho không đủ số lượng dòng, **When** nhân viên ghi nhận, **Then** đơn không được tạo và màn báo kho không còn đủ.
3. **Given** nhân viên chưa bấm ghi nhận, **When** người khác xem số có thể bán, **Then** người đó vẫn thấy số cũ.
4. **Given** khách dự án có một đợt bàn giao, **When** nhân viên chọn đợt đó và ghi nhận đơn đủ hàng, **Then** đơn ghi tên đợt đã chọn.

---

### User Story 3 - Duyệt nợ và đẩy trạng thái đơn (Priority: P3)

Với đơn chờ duyệt, nhân viên mở phiếu duyệt, nhập căn cứ và xác nhận. Đơn chuyển sang đã duyệt và số có thể bán không giảm thêm. Với đơn đã duyệt, nhân viên bấm lần lượt soạn xuất kho, bàn giao xe đi giao, rồi nghiệm thu hoàn tất. Nhân viên in được phiếu của đơn đang xem.

**Why this priority**: Các nút này có trên đơn đã tạo. Cách công nợ chưa được chốt nên không thành quy tắc. Số có thể bán lúc xuất kho đủ đơn không giảm thêm, theo spec `001-reserve-sale-stock`.

**Independent Test**: Duyệt một đơn chờ duyệt, thấy trạng thái đã duyệt và số có thể bán giữ nguyên. In một đơn và thấy mã đơn trên phiếu.

**Acceptance Scenarios**:

1. **Given** một đơn chờ duyệt đã giữ hàng, **When** nhân viên nhập căn cứ và duyệt, **Then** đơn hiện đã duyệt và số có thể bán không giảm thêm.
2. **Given** một đơn đã duyệt, **When** nhân viên bấm soạn xuất kho, **Then** đơn hiện đang soạn xuất.
3. **Given** đơn đang soạn xuất, **When** nhân viên bấm bàn giao xe, **Then** đơn hiện đang giao.
4. **Given** đơn đang giao, **When** nhân viên bấm nghiệm thu hoàn tất, **Then** đơn hiện hoàn tất.
5. **Given** một đơn đang mở, **When** nhân viên in phiếu, **Then** phiếu hiện mã đơn, khách và các dòng hàng.

---

### User Story 4 - Sửa đơn trước khi xuất chứng từ (Priority: P2)

Phiếu xuất kho là một chứng từ cho mọi mặt hàng của đơn đã đi cùng một chuyến. Trước khi phiếu xuất được ghi, Kế toán, Giám đốc hoặc Admin sửa khách, dòng hàng hoặc số lượng trên đơn. Bản xem phiếu xuất hiện đúng nội dung vừa sửa. Chứng từ thanh toán có thể tách sau phiếu xuất, theo spec `015-tach-xuat-hoa-don`.

**Why this priority**: Chứng từ đưa cho khách phải khớp đơn đang giữ hàng.

**Independent Test**: Với một đơn đã ghi nhận, chưa ghi phiếu xuất, và địa điểm của dòng còn đủ cho số lượng mới, Kế toán đổi số lượng dòng đó. Bản xem phiếu xuất hiện số lượng mới và cùng các mặt hàng của đơn.

**Acceptance Scenarios**:

1. **Given** một đơn đã ghi nhận với hai dòng hàng, **When** nhân viên mở bản xem phiếu xuất, **Then** phiếu hiện đúng hai dòng đó. Nội dung là danh sách mặt hàng của đơn sẽ đi cùng một chuyến.
2. **Given** đơn chưa ghi phiếu xuất và địa điểm của dòng còn đủ cho số lượng mới, **When** Kế toán, Giám đốc hoặc Admin đổi số lượng dòng đó và lưu, **Then** đơn và bản xem phiếu xuất đều hiện số lượng mới.
3. **Given** đơn chưa ghi phiếu xuất, **When** một trong ba vai đó đổi khách trên đơn và lưu, **Then** bản xem phiếu xuất hiện khách mới.

---

### User Story 5 - Nhập tệp báo giá để điền đơn (Priority: P2)

Nhân viên đang lập đơn chọn một tệp báo giá đã tạo từ màn báo giá. Form đơn được điền sẵn tên khách, loại khách nếu tệp có, và từng dòng mặt hàng với số lượng. Nhân viên xem lại, sửa chỗ cần sửa, chọn kho hoặc showroom xuất, rồi bấm tạo. Trước lúc bấm tạo, chưa có đơn và chưa giữ hàng.

**Why this priority**: Nhân viên không phải gõ lại từng dòng đã báo. Việc bán vẫn chỉ chốt khi họ bấm tạo.

**Independent Test**: Nhập một tệp báo giá có một khách và hai dòng hàng. Form hiện đúng khách và hai dòng. Chưa bấm tạo thì người khác vẫn thấy số tồn cũ. Bấm tạo khi kho đủ hàng thì đơn xuất hiện.

**Acceptance Scenarios**:

1. **Given** một tệp báo giá có tên khách và hai mặt hàng với số lượng lớn hơn 0, **When** nhân viên nhập tệp vào form lập đơn, **Then** form hiện tên khách đó và đúng hai dòng với đúng số lượng. Chưa có đơn mới.
2. **Given** form vừa được điền từ tệp và nhân viên chưa bấm tạo, **When** người khác xem số có thể bán, **Then** người đó vẫn thấy số cũ.
3. **Given** form đã điền từ tệp, kho hoặc showroom đã chọn còn đủ hàng, **When** nhân viên xem lại và bấm tạo, **Then** đơn được ghi nhận theo đúng nội dung đang hiện trên form, và số có thể bán giảm đúng số lượng đã tạo.
4. **Given** form đã điền từ tệp, **When** nhân viên đổi số lượng một dòng rồi bấm tạo và kho còn đủ, **Then** đơn ghi số lượng đã sửa, không ghi số lượng cũ trong tệp.

---

### Edge Cases

- Đơn không có dòng hàng: không ghi nhận được.
- Địa điểm xuất không phải kho hoặc showroom: không ghi nhận được.
- Hai người cùng lấy số cuối: người ghi nhận trước được số đó. Người sau không tạo được đơn với số lượng đã chọn.
- Lọc không ra đơn: danh sách trống.
- Đơn chưa duyệt: chưa có nút soạn xuất kho.
- Đơn chưa ghi phiếu xuất: Kế toán, Giám đốc hoặc Admin sửa được khách, dòng hàng và số lượng. Bản xem phiếu xuất hiện đúng nội dung vừa lưu.
- Lần xuất đầu có ghi nhận đã xuất và khóa sửa hay không: [NEEDS CLARIFICATION: in lại sau đó có được đổi nội dung chứng từ không?]
- Vai ngoài Kế toán, Giám đốc và Admin sửa đơn trước khi xuất: [NEEDS CLARIFICATION: các vai đó có được sửa không?]
- Tệp không phải báo giá đã tạo từ màn báo giá: form không được điền và chưa có đơn.
- Tệp có một mặt hàng không có trong danh mục: dòng đó được đánh dấu không khớp. Nhân viên bỏ dòng hoặc đổi mặt hàng thì mới bấm tạo được.
- Tệp không có dòng hàng: form không có dòng để tạo. Nhân viên thêm dòng tay hoặc chọn tệp khác.
- Nhập tệp không điền địa điểm xuất. Nhân viên chọn kho hoặc showroom trước khi tạo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST lọc đơn theo tất cả, lẻ, đại lý, nhà phân phối hoặc dự án, và MUST tìm theo mã đơn, tên khách hoặc tên nhân viên.
- **FR-002**: Một đơn trên danh sách MUST hiện mã, khách, loại, địa điểm xuất và trạng thái.
- **FR-003**: Nhân viên MUST ghi nhận đơn khi có địa điểm xuất là kho hoặc showroom và ít nhất một dòng có số lượng lớn hơn 0, nếu địa điểm còn đủ hàng.
- **FR-004**: Lúc ghi nhận, việc giữ hàng MUST theo spec `001-reserve-sale-stock`. Tồn MUST NOT xuống dưới 0. Form chưa ghi nhận MUST NOT giữ hàng.
- **FR-005**: Đơn chờ duyệt MUST mở được phiếu duyệt có ô căn cứ. Sau khi duyệt, trạng thái MUST là đã duyệt và số có thể bán MUST NOT giảm thêm.
- **FR-006**: Đơn đã duyệt MUST chuyển được sang soạn xuất, rồi đang giao, rồi hoàn tất, theo đúng thứ tự các nút đang có.
- **FR-007**: Nhân viên MUST in được phiếu xuất kho của đơn đang xem. Phiếu xuất MUST có mã đơn, khách trên đơn và các dòng hàng của đơn.
- **FR-008**: Nhân viên MUST xuất được danh sách đơn đang lọc.
- **FR-009**: Công nợ của đơn MUST [NEEDS CLARIFICATION: dư nợ bị chiếm từ lúc đơn chờ duyệt hay chỉ khi đơn đã duyệt? Phần Chưa chốt chưa có câu trả lời.]
- **FR-010**: Hủy đơn đã ghi nhận MUST [NEEDS CLARIFICATION: hủy ở bước nào, và hàng đang giữ cùng công nợ xử lý thế nào? Phần Chưa chốt chưa có câu trả lời.]
- **FR-011**: Giá, chiết khấu và thuế trên dòng đơn MUST [NEEDS CLARIFICATION: lấy bảng giá nào, ai được chiết khấu, thuế suất nào, giá đã gồm VAT chưa? Phần Chưa chốt chưa có câu trả lời.]
- **FR-012**: Phiếu xuất kho của một đơn MUST là một chứng từ cho các mặt hàng đã đi cùng một chuyến. Chứng từ thanh toán MUST được phép tách thành hai chứng từ con từ phiếu xuất đó, theo spec `015-tach-xuat-hoa-don`.
- **FR-013**: Trước khi phiếu xuất kho được ghi, Kế toán, Giám đốc và Admin MUST sửa được khách, dòng hàng và số lượng của đơn. Bản xem phiếu xuất MUST hiện đúng nội dung vừa lưu.
- **FR-014**: Mốc đã xuất MUST [NEEDS CLARIFICATION: lần xuất đầu có ghi nhận đã xuất và khóa sửa không? In lại sau đó có được đổi nội dung chứng từ không? Phần Chưa chốt chưa có câu trả lời.]
- **FR-015**: Vai ngoài Kế toán, Giám đốc và Admin MUST [NEEDS CLARIFICATION: có được sửa đơn trước khi xuất chứng từ không? Phần Chưa chốt chưa có câu trả lời.]
- **FR-016**: Nhân viên lập đơn MUST nhập được một tệp báo giá đã tạo từ màn báo giá. Form MUST được điền tên khách và các dòng mặt hàng với số lượng đang có trong tệp.
- **FR-017**: Sau khi nhập tệp, nhân viên MUST xem lại và MUST sửa được nội dung trên form trước khi tạo. Bấm tạo MUST ghi nhận đơn theo nội dung đang hiện, nếu đơn đủ điều kiện ở FR-003 và FR-004.
- **FR-018**: Nhập tệp MUST NOT tạo đơn và MUST NOT giữ hàng. Hàng chỉ giữ khi nhân viên bấm tạo và lần tạo thành công.
- **FR-019**: Tệp không đọc được như một báo giá, tệp không có dòng hàng, hoặc dòng có mặt hàng không có trong danh mục MUST NOT được tạo thành đơn cho đến khi nhân viên sửa form cho hợp lệ.

### Key Entities *(include if feature involves data)*

- **Đơn bán**: Mã, khách, loại lẻ, đại lý, nhà phân phối hoặc dự án, địa điểm xuất, các dòng hàng, trạng thái chờ duyệt, đã duyệt, đang soạn xuất, đang giao hoặc hoàn tất.
- **Dòng hàng bán**: Mặt hàng, số lượng, địa điểm xuất của đơn.
- **Phiếu xuất kho**: Bản in hoặc bản xem của hàng đã đi trên một đơn. Chứng từ thanh toán là bước sau, có thể tách theo spec `015-tach-xuat-hoa-don`.
- **Đợt bàn giao**: Đợt của khách dự án được chọn trên đơn, nếu khách có đợt.
- **Tệp báo giá**: Tệp nhân viên đã tạo từ màn báo giá, mang tên khách và các dòng mặt hàng với số lượng. Nhập tệp chỉ điền form lập đơn.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần lọc một loại chỉ còn đơn của loại đó.
- **SC-002**: 10/10 đơn ghi nhận khi kho đủ hàng đều xuất hiện trong danh sách và số có thể bán giảm đúng số lượng đã ghi.
- **SC-003**: 10/10 đơn chờ duyệt vừa được duyệt đều thành đã duyệt mà số có thể bán không giảm thêm.
- **SC-004**: 10/10 phiếu in đều có mã đơn đang xem.
- **SC-005**: 10/10 lần Kế toán, Giám đốc hoặc Admin sửa số lượng một dòng trên đơn chưa ghi phiếu xuất, khi địa điểm còn đủ cho số lượng mới, bản xem phiếu xuất hiện đúng số lượng mới và đúng các mặt hàng của đơn.
- **SC-006**: 10/10 tệp báo giá hợp lệ, sau khi nhập, đều điền đúng tên khách và đủ số dòng của tệp, và chưa tạo đơn trước khi bấm tạo.
- **SC-007**: 10/10 lần bấm tạo sau khi xem lại một form đã nhập từ tệp, khi kho đủ hàng, đều tạo đơn đúng nội dung đang hiện trên form.

## Assumptions

- Người lập đơn là nhân viên đã được phép lập đơn. Các ô quyền còn lại chỉ là đề xuất. Việc sửa đơn trước khi xuất chứng từ đã chốt cho Kế toán, Giám đốc và Admin ở FR-013.
- Loại khách trên đơn gồm lẻ, đại lý, nhà phân phối và dự án. Nhà phân phối không gộp với đại lý.
- Loại đơn xuất từ showroom: [NEEDS CLARIFICATION: showroom chỉ xuất đơn lẻ, hay cũng xuất đơn đại lý, đơn nhà phân phối và đơn công trình? Phần Chưa chốt chưa có câu trả lời.]
- Công nợ, hủy đơn, giá, chiết khấu và thuế được đánh dấu [NEEDS CLARIFICATION] ở FR-009 đến FR-011, chưa phải quy tắc.
- Mốc khóa sau khi xuất chứng từ và việc các vai còn lại có được sửa không được đánh dấu [NEEDS CLARIFICATION] ở FR-014 và FR-015, chưa phải quy tắc.
- Khi sửa số lượng hoặc đổi địa điểm trước khi xuất chứng từ, phần hàng đang giữ xử lý theo spec `001-reserve-sale-stock`, FR-016. Câu đó chưa phải quy tắc.
- Số có thể bán lúc xuất kho đủ đơn không giảm thêm, theo spec `001-reserve-sale-stock`, FR-017. Tách chứng từ thanh toán nằm ở spec `015-tach-xuat-hoa-don`.
- Việc giữ hàng lúc ghi nhận đã chốt ở spec `001-reserve-sale-stock`.
- Số tiền trên dữ liệu mẫu không phải giá hay hạn mức thật.
- Tệp báo giá dùng để điền đơn là tệp đã tạo từ màn báo giá ở spec `009-bao-gia-catalog`. Nhập tệp điền tên khách, loại khách nếu tệp có, và các dòng với số lượng. Địa điểm xuất do nhân viên chọn trên form.
- Giá hiện trên form sau khi nhập là số đang ghi trong tệp, để nhân viên xem lại. Quy tắc giá lúc bán nói chung vẫn mở ở FR-011. Đơn tạo ra lấy nội dung nhân viên đang thấy trên form lúc bấm tạo.
