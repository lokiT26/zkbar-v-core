package org.zkbar;

import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import java.util.Objects;

@DataType()
public class StudentRecord {

    @Property()
    private final String studentId;

    @Property()
    private final String did;

    @Property()
    private final String degreeName;

    @Property()
    private final double gpa;

    @Property()
    private final String graduationYear;

    @Property()
    private final String ipfsCid;

    @Property()
    private final String originalHash;

    @Property()
    private final String status;

    public StudentRecord(
        @JsonProperty("studentId") String studentId,
        @JsonProperty("did") String did,
        @JsonProperty("degreeName") String degreeName,
        @JsonProperty("gpa") double gpa,
        @JsonProperty("graduationYear") String graduationYear,
        @JsonProperty("ipfsCid") String ipfsCid,
        @JsonProperty("originalHash") String originalHash,
        @JsonProperty("status") String status) {
        
        this.studentId = studentId;
        this.did = did;
        this.degreeName = degreeName;
        this.gpa = gpa;
        this.graduationYear = graduationYear;
        this.ipfsCid = ipfsCid;
        this.originalHash = originalHash;
        this.status = status;
    }

    // Getters
    public String getStudentId() { return studentId; }
    public String getDid() { return did; }
    public String getDegreeName() { return degreeName; }
    public double getGpa() { return gpa; }
    public String getGraduationYear() { return graduationYear; }
    public String getIpfsCid() { return ipfsCid; }
    public String getOriginalHash() { return originalHash; }
    public String getStatus() { return status; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        StudentRecord other = (StudentRecord) obj;
        return Objects.equals(studentId, other.studentId) &&
               Objects.equals(did, other.did) &&
               Objects.equals(degreeName, other.degreeName) &&
               Double.compare(other.gpa, gpa) == 0 &&
               Objects.equals(graduationYear, other.graduationYear) &&
               Objects.equals(ipfsCid, other.ipfsCid) &&
               Objects.equals(originalHash, other.originalHash) &&
               Objects.equals(status, other.status);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentId, did, degreeName, gpa, graduationYear, ipfsCid, originalHash, status);
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) + 
               " [studentId=" + studentId + ", did=" + did + ", degree=" + degreeName + "]";
    }
}
